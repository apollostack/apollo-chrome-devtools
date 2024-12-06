import { MessageType, isDevtoolsMessage } from "./messages";
import type { MessageAdapter } from "./messageAdapters";
import { createWindowMessageAdapter } from "./messageAdapters";
import { createId } from "../utils/createId";
import type {
  ApolloClientInfo,
  ConnectorsDebuggingResultPayload,
  ExplorerResponse,
} from "../types";
import type { DocumentNode, FetchPolicy } from "@apollo/client";
import type { JSONObject } from "../application/types/json";

export type ActorMessage =
  | { type: "registerClient"; payload: ApolloClientInfo }
  | { type: "clientTerminated"; clientId: string }
  | {
      type: "explorerRequest";
      payload: {
        clientId: string;
        operation: DocumentNode;
        operationName: string | undefined;
        variables: JSONObject | undefined;
        fetchPolicy: FetchPolicy;
      };
    }
  | { type: "explorerResponse"; payload: ExplorerResponse }
  | { type: "explorerSubscriptionTermination" }
  | { type: "pageNavigated" }
  | { type: "initializePanel" }
  | { type: "panelHidden" }
  | { type: "panelShown" }
  | {
      type: "connectorsDebuggingResult";
      payload: ConnectorsDebuggingResultPayload;
    };

export type ApolloClientDevtoolsActorMessage = {
  id: string;
  source: "apollo-client-devtools";
  type: MessageType.Actor;
  message: ActorMessage;
};

export interface Actor {
  on: <TName extends ActorMessage["type"]>(
    name: TName,
    callback: Extract<ActorMessage, { type: TName }> extends infer Message
      ? (message: Message) => void
      : never,
    options?: OptionsWithAbortSignal
  ) => () => void;
  send: (message: ActorMessage) => void;
}

export function createActor(adapter: MessageAdapter): Actor {
  let removeListener: (() => void) | null = null;
  const messageListeners = new Map<
    ActorMessage["type"],
    Set<(message: ActorMessage) => void>
  >();

  function handleMessage(message: unknown) {
    if (!isActorMessage(message)) {
      return;
    }

    const listeners = messageListeners.get(message.message.type);

    if (listeners) {
      for (const listener of listeners) {
        listener(message.message);
      }
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

  const on: Actor["on"] = (name, callback, options = {}) => {
    let listeners = messageListeners.get(name) as Set<typeof callback>;

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(name, listeners);
    }

    listeners.add(callback);
    startListening();

    const cleanup = () => {
      listeners!.delete(callback);

      if (listeners.size === 0) {
        messageListeners.delete(name);
      }

      if (messageListeners.size === 0) {
        stopListening();
      }
    };
    if (options.signal) {
      options.signal.addEventListener("abort", cleanup, { once: true });
    }
    return cleanup;
  };

  return {
    on,
    send: (message) => {
      adapter.postMessage({
        id: createId(),
        source: "apollo-client-devtools",
        type: MessageType.Actor,
        message,
      });
    },
  };
}

export function createWindowActor(window: Window) {
  return createActor(createWindowMessageAdapter(window));
}

function isActorMessage(
  message: unknown
): message is ApolloClientDevtoolsActorMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.Actor;
}

export interface OptionsWithAbortSignal {
  signal?: AbortSignal;
}
