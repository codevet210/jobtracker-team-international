type Handler<T> = (payload: T) => void;

export function createTypedEventEmitter<
  Events extends Record<string, unknown>,
>() {
  const listeners: {
    [K in keyof Events]?: Set<Handler<Events[K]>>;
  } = {};

  return {
    on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
      const existing = listeners[event];
      if (existing) {
        existing.add(handler);
        return;
      }

      listeners[event] = new Set([handler]);
    },

    off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
      listeners[event]?.delete(handler);
    },

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
      const handlers = listeners[event];
      if (!handlers) {
        return;
      }

      for (const handler of handlers) {
        handler(payload);
      }
    },
  };
}
