/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApolloClient } from "@apollo/client";
import { getPrivateAccess } from "../../privateAccess";
import { createActor } from "../actor";
import { createRpcClient, createRpcHandler } from "../rpc";
import { getQueries, getMutations } from "../tab/helpers";
import { loadErrorCodes } from "../tab/loadErrorCodes";
import type { MessageAdapter } from "../messageAdapters";
import { handleExplorerRequests } from "../tab/handleExplorerRequests";
import { setMaxListeners, WeakRef, FinalizationRegistry } from "./polyfills";
import { createId } from "../../utils/createId";

type Reason =
  | "WS_DISCONNECTED"
  | "CLIENT_GC"
  | "WS_ERROR"
  | "MANUAL_DISCONNECT"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

type RemoveListener = () => void;

interface ApolloClientDevToolsConnection {
  /** A promise that resolves once the connection with the DevTools has successfully been established. */
  connectedPromise: Promise<void>;
  /**
   * Disconnects the Apollo Client from the DevTools. You can add a `reason`, which will be available in the `onCleanup` listener.
   * @param reason - defaults to `"MANUAL_DISCONNECT"`.
   */
  disconnect: (reason?: Reason) => void;
  /**
   * Registers a callback that will be called when the connection is being cleaned up.
   * That could e.g. happen on WebSocket error, client garbage collection, or manual disconnection.
   * The callback will receive a `reason` string that indicates why the connection is being cleaned up.
   * Internal values for `reason` are `"WS_DISCONNECTED"` | `"CLIENT_GC"` | `"WS_ERROR"` | `"MANUAL_DISCONNECT"`,
   * or the argument you provided when calling `disconnect`.
   */
  onCleanup: (cleanup: (reason: Reason) => void) => RemoveListener;
}

/**
 * Connects an Apollo Client instance to the VS Code Apollo DevTools.
 * @param client - Your Apollo Client instance.
 * @param vsCodeServerUrl - WebSocket URL of the VS Code Apollo DevTools server.
 * The default port is 7095, so for local development you would usually use "ws://localhost:7095".
 * @returns {ApolloClientDevToolsConnection}
 */
export function connectApolloClientToVSCodeDevTools(
  client: ApolloClient<any>,
  vsCodeServerUrl:
    | ConstructorParameters<typeof WebSocket>[0]
    | ConstructorParameters<typeof WebSocket>
): ApolloClientDevToolsConnection {
  const clientRef = new WeakRef(client);
  const registered = registerClient(clientRef, vsCodeServerUrl);
  const registry = new FinalizationRegistry(registered.disconnect);
  const unregisterToken = {};
  registry.register(client, "CLIENT_GC", unregisterToken);
  registered.onCleanup(() => registry.unregister(unregisterToken));
  return registered;
}

function makeErrorHandler(cleanup: (reason?: Reason) => void): EventListener {
  return (e) => {
    console.error("Apollo DevTools Client encountered WebSocket error:", e);
    cleanup("WS_ERROR");
  };
}

function registerClient(
  clientRef: WeakRef<ApolloClient<any>>,
  url:
    | ConstructorParameters<typeof WebSocket>[0]
    | ConstructorParameters<typeof WebSocket>
): ApolloClientDevToolsConnection {
  const { signal, cleanup, onCleanup } = getCleanupController();

  function getClient() {
    const client = clientRef.deref();
    if (client) {
      return getPrivateAccess(client);
    } else {
      cleanup("CLIENT_GC");
    }
  }

  const wsArgs: ConstructorParameters<typeof WebSocket> = Array.isArray(url)
    ? url
    : [url];
  const ws = new WebSocket(...wsArgs);
  onCleanup(ws.close.bind(ws, 1000));
  ws.addEventListener("close", cleanup.bind(undefined, "WS_DISCONNECTED"), {
    once: true,
    signal,
  });
  ws.addEventListener("error", makeErrorHandler(cleanup), {
    once: true,
    signal,
  });

  const wsAdapter = createWsAdapter(ws, signal);
  const wsRpcClient = createRpcClient(wsAdapter);
  const wsRpcHandler = createRpcHandler(wsAdapter);
  const wsActor = createActor(wsAdapter);
  function getQueriesForClient() {
    return getQueries(
      getClient()?.queryManager.getObservableQueries("active") ?? new Map()
    );
  }
  function getMutationsForClient() {
    return getMutations(getClient()?.queryManager.mutationStore ?? {});
  }
  function getMemoryInternalsForClient() {
    return getClient()?.getMemoryInternals?.();
  }
  wsRpcHandler("getQueries", getQueriesForClient, { signal });
  wsRpcHandler("getMutations", getMutationsForClient, { signal });
  wsRpcHandler("getMemoryInternals", getMemoryInternalsForClient, { signal });
  wsRpcHandler("getCache", () => getClient()?.cache.extract(true) ?? {}, {
    signal,
  });
  handleExplorerRequests(wsActor, getClient, { signal });

  const id = createId();

  ws.addEventListener(
    "open",
    function open() {
      const client = getClient();
      if (!client) {
        return;
      }
      wsActor.send({
        type: "registerClient",
        payload: {
          id,
          name:
            "devtoolsConfig" in client ? client.devtoolsConfig.name : undefined,
          version: client.version,
          queryCount: getQueriesForClient().length,
          mutationCount: getMutationsForClient().length,
        },
      });
      loadErrorCodes(wsRpcClient, client.version);
    },
    { once: true, signal }
  );

  return {
    connectedPromise: new Promise<void>((resolve, reject) => {
      ws.addEventListener("open", () => resolve(), { once: true, signal });
      ws.addEventListener("error", reject, { once: true, signal });
    }),
    disconnect: cleanup,
    onCleanup,
  };
}

function createWsAdapter(ws: WebSocket, signal: AbortSignal): MessageAdapter {
  return {
    addListener(listener) {
      const wrappedListener = (ev: MessageEvent<any>) => {
        listener(JSON.parse(ev.data));
      };
      ws.addEventListener("message", wrappedListener, { signal });
      return () => ws.removeEventListener("message", wrappedListener);
    },
    postMessage(message) {
      ws.send(JSON.stringify(message));
    },
  };
}

function getCleanupController() {
  const cleanupContoller = new AbortController();
  const signal = cleanupContoller.signal;
  setMaxListeners(20, signal);
  function onCleanup(cleanupFn: (reason: Reason) => void): () => void {
    if (signal.aborted) {
      cleanupFn(signal.reason);
    }
    const listener = () => cleanupFn(signal.reason);
    signal.addEventListener("abort", listener, {
      once: true,
    });
    return () => signal.removeEventListener("abort", listener);
  }
  return {
    cleanup: (reason: Reason = "MANUAL_DISCONNECT") =>
      cleanupContoller.abort(reason),
    signal,
    onCleanup,
  };
}
