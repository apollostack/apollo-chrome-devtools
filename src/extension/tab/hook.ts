import type { ApolloClient } from "@apollo/client";

// All manifests should contain the same version number so it shouldn't matter
// which one we import from.
import * as manifest from "../chrome/manifest.json";
const { version: devtoolsVersion } = manifest;
import type { MutationDetails, QueryDetails } from "./helpers";
import { getQueries, getQueriesLegacy, getMutations } from "./helpers";
import type {
  ApolloClientInfo,
  ConnectorsDebuggingResultPayload,
  SafeAny,
} from "../../types";
import { getPrivateAccess } from "../../privateAccess";
import type { JSONObject } from "../../application/types/json";
import { createWindowActor } from "../actor";
import { createWindowMessageAdapter } from "../messageAdapters";
import { createRpcClient, createRpcHandler } from "../rpc";
import { loadErrorCodes } from "./loadErrorCodes";
import { createId } from "../../utils/createId";
import { handleExplorerRequests } from "./handleExplorerRequests";

declare global {
  type TCache = any;

  interface Window {
    __APOLLO_CLIENT__?: ApolloClient<TCache>;
    [DEVTOOLS_KEY]?: {
      push(client: ApolloClient<any>): void;
    };
  }
}

type Hook = {
  ApolloClient: ApolloClient<any> | undefined;
  version: string;
  getQueries: () => QueryDetails[];
  getMutations: () => MutationDetails[];
  getCache: () => JSONObject;
};

const DEVTOOLS_KEY = Symbol.for("apollo.devtools");

const tab = createWindowActor(window);
const messageAdapter = createWindowMessageAdapter(window, {
  jsonSerialize: true,
});
const handleRpc = createRpcHandler(messageAdapter);
const rpcClient = createRpcClient(messageAdapter);

function getQueriesForClient(client: ApolloClient<unknown> | undefined) {
  const ac = getPrivateAccess(client);
  if (ac?.queryManager.getObservableQueries) {
    return getQueries(ac.queryManager.getObservableQueries("active"));
  } else {
    return getQueriesLegacy(ac?.queryManager["queries"]);
  }
}

function getMutationsForClient(client: ApolloClient<unknown> | undefined) {
  const ac = getPrivateAccess(client);

  return getMutations(
    (ac?.queryManager.mutationStore?.getStore
      ? // @ts-expect-error Apollo Client 3.0 - 3.2
        ac.queryManager.mutationStore?.getStore()
      : // Apollo Client 3.3
        ac?.queryManager.mutationStore) ?? {}
  );
}

// Keep a reverse mapping of client -> id to ensure we don't register the same
// client multiple times.
const knownClients = new Map<ApolloClient<SafeAny>, string>();
const hook: Hook = {
  get ApolloClient() {
    logDeprecation("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.ApolloClient");

    return globalClient;
  },
  version: devtoolsVersion,
  getQueries() {
    logDeprecation("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.getQueries()");

    return getQueriesForClient(hook.ApolloClient);
  },
  getMutations: () => {
    logDeprecation("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.getMutations()");

    return getMutationsForClient(hook.ApolloClient);
  },
  getCache: () => {
    logDeprecation("window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.getCache()");

    return hook.ApolloClient?.cache.extract(true) ?? {};
  },
};

Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
  get() {
    return hook;
  },
  configurable: true,
});

function getClientInfo(client: ApolloClient<unknown>): ApolloClientInfo {
  return {
    id: knownClients.get(client)!,
    name: "devtoolsConfig" in client ? client.devtoolsConfig.name : undefined,
    version: client.version,
    queryCount: getQueriesForClient(client).length,
    mutationCount: getMutationsForClient(client).length,
  };
}

handleRpc("getClients", () => {
  return [...knownClients.keys()].map(getClientInfo);
});

handleRpc("getClient", (clientId) => {
  const client = getClientById(clientId);

  return client ? getClientInfo(client) : null;
});

handleRpc("getQueries", (clientId) =>
  getQueriesForClient(getClientById(clientId))
);

handleRpc("getMutations", (clientId) =>
  getMutationsForClient(getClientById(clientId))
);

handleRpc("getCache", (clientId) => {
  return getClientById(clientId)?.cache.extract(true) ?? {};
});

// Temporarily hold all connectors requests until the devtools connects and asks
// for them. After these are requests, we clear this array since we no longer
// need to hold onto the requests here.
let connectorsRequests: ConnectorsDebuggingResultPayload[] = [];
handleRpc("getConnectorsRequests", () => {
  try {
    return connectorsRequests;
  } finally {
    disconnectFromDebuggingResults();
    connectorsRequests = [];
  }
});

const disconnectFromDebuggingResults = tab.on(
  "connectorsDebuggingResult",
  ({ payload }) => {
    connectorsRequests.push(payload);
  }
);

function getClientById(clientId: string) {
  const [client] =
    [...knownClients.entries()].find(([, id]) => id === clientId) ?? [];

  return client;
}

handleExplorerRequests(tab, getClientById);

function watchForClientTermination(client: ApolloClient<any>) {
  const originalStop = client.stop;

  client.stop = () => {
    const clientId = knownClients.get(client)!;
    knownClients.delete(client);

    if (window.__APOLLO_CLIENT__ === client) {
      window.__APOLLO_CLIENT__ = undefined;
    }

    tab.send({ type: "clientTerminated", clientId });
    originalStop.call(client);
  };
}

function registerClient(client: ApolloClient<any>) {
  if (!knownClients.has(client)) {
    const id = createId();
    knownClients.set(client, id);
    watchForClientTermination(client);

    tab.send({ type: "registerClient", payload: getClientInfo(client) });
  }

  // TODO: Repurpose this callback. The message it sent was not listened by
  // anything, so the broadcast was useless. Currently the devtools rely on
  // polling the client every second for updates, rather than relying on
  // this callback to update the devtools state.
  // client.__actionHookForDevTools(() => {
  //   if (client !== hook.ApolloClient) {
  //     // if the client has changed, don't send the action hook
  //     return;
  //   }
  // });

  loadErrorCodes(rpcClient, client.version);
}

const preExisting = window[DEVTOOLS_KEY];
window[DEVTOOLS_KEY] = { push: registerClient };
if (Array.isArray(preExisting)) {
  (preExisting as Array<ApolloClient<any>>).forEach(registerClient);
}

// Handles registering legacy clients (< v3.7) which do not use the new
// registration mechanism above.
let globalClient = window.__APOLLO_CLIENT__;
Object.defineProperty(window, "__APOLLO_CLIENT__", {
  get() {
    return globalClient;
  },
  set(client: ApolloClient<SafeAny> | undefined) {
    if (client) {
      // We call this in a setTimeout because the client is not fully
      // instantiated before the property on window is assigned since it
      // connects from the constructor of ApolloClient. This allows
      // initialization to finish before we register it.
      setTimeout(() => registerClient(client));
    }

    globalClient = client;
  },
  configurable: true,
});

if (globalClient) {
  registerClient(globalClient);
}

function logDeprecation(api: string) {
  console.warn(
    `[Apollo Client Devtools]: '${api}' is deprecated and will be removed in a future version.`
  );
}
