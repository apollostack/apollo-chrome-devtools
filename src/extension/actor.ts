import browser from "webextension-polyfill";
import type { MessageFormat } from "./messages";
import { isApolloClientDevtoolsMessage } from "./messages";
import type { NoInfer, SafeAny } from "../types";
import {
  MessageAdapter,
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "./messageAdapters";

export interface Actor<Messages extends MessageFormat> {
  on: <TName extends Messages["type"]>(
    name: TName,
    callback: Extract<Messages, { type: TName }> extends infer Message
      ? (message: Message) => void
      : never
  ) => () => void;
  bridge: (actor: Actor<SafeAny>) => () => void;
  send: (message: Messages) => void;
  forward: <TName extends Messages["type"]>(
    name: TName,
    actor: Actor<Extract<Messages, { type: NoInfer<TName> }>>
  ) => () => void;
}

export function createActor<Messages extends MessageFormat>(
  adapter: MessageAdapter
): Actor<Messages> {
  let removeListener: (() => void) | null = null;
  const messageListeners = new Map<
    Messages["type"],
    Set<(message: Messages) => void>
  >();
  const bridges = new Set<(message: Messages) => void>();

  function handleMessage(message: unknown) {
    if (!isApolloClientDevtoolsMessage<Messages>(message)) {
      return;
    }

    const listeners = messageListeners.get(message.message.type);

    if (listeners) {
      for (const listener of listeners) {
        listener(message.message);
      }
    }

    bridges.forEach((bridge) => bridge(message.message));
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

  const on: Actor<Messages>["on"] = (name, callback) => {
    let listeners = messageListeners.get(name) as Set<typeof callback>;

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(name, listeners as Set<(message: Messages) => void>);
    }

    listeners.add(callback);
    startListening();

    return () => {
      listeners!.delete(callback);

      if (listeners.size === 0) {
        messageListeners.delete(name);
      }

      if (messageListeners.size === 0 && bridges.size === 0) {
        stopListening();
      }
    };
  };

  return {
    on,
    bridge: (actor) => {
      bridges.add(actor.send);
      startListening();

      return () => {
        bridges.delete(actor.send);

        if (messageListeners.size === 0 && bridges.size === 0) {
          stopListening();
        }
      };
    },
    send: (message) => {
      adapter.postMessage({
        source: "apollo-client-devtools",
        message,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forward: (name, actor) => on(name, actor.send as unknown as any),
  };
}

export function createPortActor<
  Messages extends MessageFormat = {
    type: "Error: Pass <Messages> to `createPortActor<Messages>()`";
  },
>(port: browser.Runtime.Port) {
  return createActor<Messages>(createPortMessageAdapter(port));
}

export function createWindowActor<
  Messages extends MessageFormat = {
    type: "Error: Pass <Messages> to `createWindowActor<Messages>()`";
  },
>(window: Window) {
  return createActor<Messages>(createWindowMessageAdapter(window));
}
