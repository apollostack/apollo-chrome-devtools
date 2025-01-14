/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WebSocketServer, RawData, WebSocket } from "ws";
import type { MessageAdapter } from "../messageAdapters";
import { createRpcClient, createRpcHandler } from "../rpc";
import type { Actor } from "../actor";
import { createActor } from "../actor";
import type { ApolloClientInfo } from "../../types";
import allErrorCodes from "../../../all-clients/errorcodes.json";
import { restoreErrorCodes } from "../../../all-clients/restore-errorcodes.mjs";

// copied into this file to ease type bundling for now
export interface PublicMessageAdapter {
  addListener: (listener: (message: unknown) => void) => () => void;
  postMessage: (message: unknown) => void;
}

export function runServer(
  server: WebSocketServer,
  adapter: PublicMessageAdapter
) {
  const clients = new Map<
    string,
    {
      rpcClient: ReturnType<typeof createRpcClient>;
      actor: Actor;
      info: ApolloClientInfo;
    }
  >();

  const messageAdapter = adapter as MessageAdapter;
  const vscodeActor = createActor(messageAdapter);
  const handleRpc = createRpcHandler(messageAdapter);

  handleRpc("getClients", () =>
    Array.from(clients.values()).map(({ info }) => info)
  );
  handleRpc("getClient", (id) => clients.get(id)!.info);
  handleRpc("getQueries", (id) =>
    clients.get(id)!.rpcClient.request("getQueries", id)
  );
  handleRpc("getMutations", (id) =>
    clients.get(id)!.rpcClient.request("getMutations", id)
  );
  handleRpc("getCache", (id) =>
    clients.get(id)!.rpcClient.request("getCache", id)
  );

  handleRpc("getMemoryInternals", (id) =>
    clients.get(id)!.rpcClient.request("getMemoryInternals", id)
  );

  server.on("connection", function connection(ws) {
    let id: string | undefined;
    const wsAdapter = createSocketMessageAdapter(ws);
    const wsRpcClient = createRpcClient(wsAdapter);
    const wsRpcHandler = createRpcHandler(wsAdapter);
    const wsActor = createActor(wsAdapter);
    wsActor.on("registerClient", (message) => {
      id = message.payload.id;
      clients.set(id, {
        info: message.payload,
        actor: wsActor,
        rpcClient: wsRpcClient,
      });
      vscodeActor.send(message);
    });
    wsActor.on("explorerResponse", (message) => {
      vscodeActor.send(message);
    });
    wsRpcHandler("getErrorCodes", (version) => {
      if (version in allErrorCodes.byVersion) {
        return restoreErrorCodes(allErrorCodes, version);
      }
    });
    ws.on("close", () => {
      if (id && clients.has(id)) {
        vscodeActor.send({ type: "clientTerminated", clientId: id });
        clients.delete(id);
      }
    });
  });

  vscodeActor.on("explorerRequest", (message) => {
    const { clientId } = message.payload;
    const client = clients.get(clientId);
    if (!client) {
      throw new Error("Could not find selected client");
    }
    client.actor.send(message);
  });
  vscodeActor.on("explorerSubscriptionTermination", () => {
    for (const client of clients.values()) {
      client.actor.send({ type: "explorerSubscriptionTermination" });
    }
  });
}

function createSocketMessageAdapter(ws: WebSocket): MessageAdapter {
  return {
    addListener(listener) {
      const wrappedListener = (message: RawData) =>
        listener(JSON.parse(message.toString()));
      ws.on("message", wrappedListener);
      return () => void ws.off("message", wrappedListener);
    },
    postMessage(message) {
      ws.send(JSON.stringify(message));
    },
  };
}
