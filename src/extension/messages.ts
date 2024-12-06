import type { ApolloClientDevtoolsActorMessage } from "./actor";
import type { RPCRequestMessage, RPCResponseMessage } from "./rpc";

export const enum MessageType {
  RPCRequest = "rpcRequest",
  RPCResponse = "rpcResponse",
  Actor = "actor",
}

export type ApolloClientDevtoolsMessage =
  | ApolloClientDevtoolsActorMessage
  | RPCRequestMessage
  | RPCResponseMessage;

export function isDevtoolsMessage(
  message: unknown
): message is ApolloClientDevtoolsMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "source" in message &&
    (message.source === "apollo-client-devtools" ||
      message.source === "apollo-client")
  );
}
