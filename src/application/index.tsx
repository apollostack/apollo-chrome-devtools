import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Reference } from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";

import { colorTheme, listenForThemeChange } from "./theme";
import { fragmentRegistry } from "./fragmentRegistry";
import * as Tooltip from "@radix-ui/react-tooltip";

import { getRpcClient } from "../extension/devtools/panelRpcClient";
import { createSchemaWithRpcClient } from "./schema";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { getPanelActor } from "../extension/devtools/panelActor";
import { connectorsRequestsVar } from "./vars";
import type { ConnectorsDebuggingResultPayload } from "../types";

loadDevMessages();
loadErrorMessages();

const rpcClient = getRpcClient();
const schema = createSchemaWithRpcClient(rpcClient);
const link = new SchemaLink({ schema });

const cache = new InMemoryCache({
  fragments: fragmentRegistry,
  possibleTypes: {
    WatchedMutationError: ["SerializedError", "SerializedApolloError"],
  },
  typePolicies: {
    WatchedQuery: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    WatchedMutation: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    Client: {
      fields: {
        cache: {
          merge: false,
        },
      },
    },
    ClientQueries: {
      keyFields: false,
      merge: true,
    },
    ClientMutations: {
      keyFields: false,
      merge: true,
    },
    SerializedApolloError: {
      keyFields: false,
    },
    SerializedGraphQLError: {
      keyFields: false,
    },
  },
});

export const client = new ApolloClient({ cache, link });

export const removeClient = (clientId: string) => {
  client.cache.modify({
    id: "ROOT_QUERY",
    fields: {
      clients: (clients, { readField }) => {
        return clients.filter(
          (client: Reference) => readField("id", client) !== clientId
        );
      },
    },
  });
};

export const AppProvider = () => {
  useEffect(() =>
    listenForThemeChange((newColorTheme) => colorTheme(newColorTheme))
  );

  return (
    <Tooltip.Provider delayDuration={0}>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </Tooltip.Provider>
  );
};

export const initDevTools = () => {
  const root = createRoot(document.getElementById("devtools") as HTMLElement);

  rpcClient
    .withTimeout(3000)
    .request("getConnectorsRequests")
    .then((results) => {
      connectorsRequestsVar(results.map(assignConnectorsIds));
    })
    .catch(() => {
      // Ignore errors
    });

  root.render(<AppProvider />);
};

let nextPayloadId = 0;
const actor = getPanelActor(window);

actor.on("connectorsDebuggingResult", ({ payload }) => {
  connectorsRequestsVar([
    ...connectorsRequestsVar(),
    assignConnectorsIds(payload),
  ]);
});

actor.on("pageNavigated", () => connectorsRequestsVar([]));
actor.on("clientTerminated", () => connectorsRequestsVar([]));

function assignConnectorsIds(result: ConnectorsDebuggingResultPayload) {
  return {
    ...result,
    id: ++nextPayloadId,
    debuggingResult: {
      ...result.debuggingResult,
      data: result.debuggingResult.data.map((data, idx) => ({
        ...data,
        id: idx + 1,
      })),
    },
  };
}
