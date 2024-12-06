import type { ErrorCodes } from "@apollo/client/invariantErrorCodes";
import type { JSONObject } from "../application/types/json";
import type {
  ApolloClientInfo,
  ConnectorsDebuggingResultPayload,
  NoInfer,
  SafeAny,
} from "../types";
import { createId } from "../utils/createId";
import { RPC_MESSAGE_TIMEOUT } from "./errorMessages";
import { deserializeError, serializeError } from "./errorSerialization";
import type { MessageAdapter } from "./messageAdapters";
import { MessageType, isDevtoolsMessage } from "./messages";
import type { MutationDetails, QueryDetails } from "./tab/helpers";

export type RPCRequest = {
  getClients(): ApolloClientInfo[];
  getClient(id: string): ApolloClientInfo | null;
  getQueries(clientId: string): QueryDetails[];
  getMutations(clientId: string): MutationDetails[];
  getCache(clientId: string): JSONObject;
  getErrorCodes(version: string): Promise<ErrorCodes | undefined>;
  getConnectorsRequests(): ConnectorsDebuggingResultPayload[];
};

export interface RpcClient {
  readonly timeout: number;
  withTimeout: (timeoutMs: number) => RpcClient;
  request: <TName extends keyof RPCRequest & string>(
    name: TName,
    ...params: Parameters<RPCRequest[TName]>
  ) => Promise<Awaited<ReturnType<RPCRequest[TName]>>>;
}

type RPCErrorResponseMessage = {
  source: "apollo-client-devtools";
  type: MessageType.RPCResponse;
  id: string;
  sourceId: string;
  error: { name?: string; message: string; stack?: string };
};

type RPCSuccessResponseMessage<Result = unknown> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCResponse;
  id: string;
  sourceId: string;
  result: Result;
};

export type RPCRequestMessage<Params extends SafeAny[] = unknown[]> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCRequest;
  id: string;
  name: string;
  params: Params;
};

export type RPCResponseMessage<Result = unknown> =
  | RPCSuccessResponseMessage<Result>
  | RPCErrorResponseMessage;

const DEFAULT_TIMEOUT = 30_000;

export function createRpcClient(adapter: MessageAdapter): RpcClient {
  return {
    timeout: DEFAULT_TIMEOUT,
    withTimeout(timeoutMs) {
      return { ...this, timeout: timeoutMs };
    },
    request(name, ...params) {
      return new Promise<SafeAny>((resolve, reject) => {
        const id = createId();

        const timeout = setTimeout(() => {
          removeListener();
          reject(new Error(RPC_MESSAGE_TIMEOUT));
        }, this.timeout);

        const removeListener = adapter.addListener((message) => {
          if (!isRPCResponseMessage(message) || message.sourceId !== id) {
            return;
          }

          if ("error" in message) {
            reject(deserializeError(message.error));
          } else {
            resolve(message.result);
          }

          clearTimeout(timeout);
          removeListener();
        });

        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCRequest,
          id,
          name,
          params,
        });
      });
    },
  };
}

export function createRpcHandler(adapter: MessageAdapter) {
  const listeners = new Map<string, (message: RPCRequestMessage) => void>();
  let removeListener: (() => void) | null = null;

  function handleMessage(message: unknown) {
    if (isRPCRequestMessage(message)) {
      listeners.get(message.name)?.(message);
    }
  }

  function startListening() {
    if (!removeListener) {
      removeListener = adapter.addListener(handleMessage);
    }
  }

  function stopListening() {
    if (removeListener) {
      removeListener();
      removeListener = null;
    }
  }

  return function <TName extends keyof RPCRequest & string>(
    name: TName,
    handler: (
      ...params: Parameters<RPCRequest[TName]>
    ) =>
      | NoInfer<Awaited<ReturnType<RPCRequest[TName]>>>
      | Promise<NoInfer<Awaited<ReturnType<RPCRequest[TName]>>>>,
    options: { signal?: AbortSignal } = {}
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    listeners.set(name, async ({ id, params }) => {
      try {
        const result = await Promise.resolve(
          handler(...(params as Parameters<RPCRequest[TName]>))
        );

        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCResponse,
          id: createId(),
          sourceId: id,
          result,
        });
      } catch (e) {
        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCResponse,
          id: createId(),
          sourceId: id,
          error: serializeError(e),
        });
      }
    });

    startListening();

    const cleanup = () => {
      listeners.delete(name);

      if (listeners.size === 0) {
        stopListening();
      }
    };
    if (options.signal) {
      options.signal.addEventListener("abort", cleanup, { once: true });
    }
    return cleanup;
  };
}

export function isRPCRequestMessage(
  message: unknown
): message is RPCRequestMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.RPCRequest;
}

function isRPCResponseMessage(message: unknown): message is RPCResponseMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.RPCResponse;
}
