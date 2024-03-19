import { createMachine } from "../stateMachine";

test("getState returns initial state", () => {
  const machine = createMachine({
    initial: "idle",
    initialContext: {},
    types: {} as { events: { type: "ignore" } },
    states: {
      idle: {},
    },
  });

  expect(machine.getState()).toEqual({ value: "idle", context: {} });
});

test("can transition to another state", () => {
  const machine = createMachine({
    initial: "off",
    initialContext: {},
    types: {} as {
      events: { type: "on" } | { type: "off" };
    },
    states: {
      off: {
        events: {
          on: "on",
        },
      },
      on: {
        events: { off: "off" },
      },
    },
  });

  machine.send({ type: "on" });

  expect(machine.getState()).toEqual({ value: "on", context: {} });
});

test("does not transition and warns when sending event that current state does not handle", () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  const machine = createMachine({
    initial: "pending",
    initialContext: {},
    types: {} as {
      events: { type: "resolve" } | { type: "reject" };
    },
    states: {
      pending: {
        events: {
          resolve: "fulfilled",
          reject: "rejected",
        },
      },
      fulfilled: {},
      rejected: {},
    },
  });

  machine.send({ type: "resolve" });
  machine.send({ type: "reject" });

  expect(machine.getState()).toEqual({ value: "fulfilled", context: {} });

  expect(consoleSpy).toHaveBeenCalledTimes(1);
  expect(consoleSpy).toHaveBeenCalledWith(
    "Transition from state 'fulfilled' for event 'reject' not found."
  );

  consoleSpy.mockRestore();
  process.env.NODE_ENV = originalEnv;
});

test("can set context on machine while sending event", () => {
  const machine = createMachine({
    initial: "pending",
    initialContext: {
      value: "initial",
    },
    types: {} as {
      events: { type: "resolve" } | { type: "reject" };
    },
    states: {
      pending: {
        events: {
          resolve: "fulfilled",
          reject: "rejected",
        },
      },
      fulfilled: {},
      rejected: {},
    },
  });

  expect(machine.getState()).toEqual({
    value: "pending",
    context: { value: "initial" },
  });

  machine.send({ type: "resolve", context: { value: "resolved" } });

  expect(machine.getState()).toEqual({
    value: "fulfilled",
    context: { value: "resolved" },
  });
});

test("can subscribe to state changes", () => {
  const machine = createMachine({
    initial: "off",
    initialContext: { count: 0 },
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const listener = jest.fn();
  const unsubscribe = machine.subscribe(listener);

  machine.send({ type: "turnOn", context: { count: 1 } });

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith({
    state: { value: "on", context: { count: 1 } },
    event: { type: "turnOn", context: { count: 1 } },
  });

  unsubscribe();

  machine.send({ type: "turnOff", context: { count: 2 } });

  expect(listener).toHaveBeenCalledTimes(1);
});

test("can listen to transitions to a specific state", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const onListener = jest.fn();
  const offListener = jest.fn();
  machine.onTransition("on", onListener);
  machine.onTransition("off", offListener);

  machine.send({ type: "turnOn" });
  expect(onListener).toHaveBeenCalledTimes(1);
  expect(offListener).toHaveBeenCalledTimes(0);

  machine.send({ type: "turnOff" });
  expect(onListener).toHaveBeenCalledTimes(1);
  expect(offListener).toHaveBeenCalledTimes(1);
});

test("can listen to transitions from a specific state", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const onListener = jest.fn();
  const offListener = jest.fn();
  const unsubscribe = machine.onLeave("on", onListener);
  machine.onLeave("off", offListener);

  machine.send({ type: "turnOn" });
  expect(onListener).toHaveBeenCalledTimes(0);
  expect(offListener).toHaveBeenCalledTimes(1);

  machine.send({ type: "turnOff" });
  expect(onListener).toHaveBeenCalledTimes(1);
  expect(offListener).toHaveBeenCalledTimes(1);

  unsubscribe();
  machine.send({ type: "turnOn" });
  expect(onListener).toHaveBeenCalledTimes(1);
});

test("runs leave listeners before transition listeners", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const listener = jest.fn();
  machine.onLeave("off", () => listener("onLeave"));
  machine.onTransition("on", () => listener("onTransition"));

  machine.send({ type: "turnOn" });
  expect(listener).toHaveBeenNthCalledWith(1, "onLeave");
  expect(listener).toHaveBeenNthCalledWith(2, "onTransition");
});

test("can return onLeave listener from onTransition", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const listener = jest.fn();
  machine.onTransition("on", () => {
    return () => listener();
  });

  machine.send({ type: "turnOn" });
  expect(listener).not.toHaveBeenCalled();

  machine.send({ type: "turnOff" });
  expect(listener).toHaveBeenCalledTimes(1);

  machine.send({ type: "turnOn" });
  expect(listener).toHaveBeenCalledTimes(1);

  machine.send({ type: "turnOff" });
  expect(listener).toHaveBeenCalledTimes(2);
});

test("only runs onLeave listener returned from onTransition once", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  let count = 0;
  const listener = jest.fn();

  machine.onTransition("on", () => {
    if (count++ < 1) {
      return () => listener();
    }
  });

  machine.send({ type: "turnOn" });
  machine.send({ type: "turnOff" });
  expect(listener).toHaveBeenCalledTimes(1);

  machine.send({ type: "turnOn" });
  machine.send({ type: "turnOff" });
  expect(listener).toHaveBeenCalledTimes(1);
});

test("can run returned onLeave and dedicated onLeave handler for a single state", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const inlineListener = jest.fn();
  const onLeaveListener = jest.fn();

  machine.onTransition("on", () => {
    return () => inlineListener();
  });

  machine.onLeave("on", onLeaveListener);

  machine.send({ type: "turnOn" });
  machine.send({ type: "turnOff" });
  expect(inlineListener).toHaveBeenCalledTimes(1);
  expect(onLeaveListener).toHaveBeenCalledTimes(1);

  machine.send({ type: "turnOn" });
  machine.send({ type: "turnOff" });
  expect(inlineListener).toHaveBeenCalledTimes(2);
  expect(onLeaveListener).toHaveBeenCalledTimes(2);
});
