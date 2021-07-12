// eslint-disable-next-line import/no-cycle
import { Director, dispatch, Message } from '../index';
import { randomstring } from '../utils';

const createDefaultStorage = (defaultValue: Record<string, unknown> = {}) => {
  const data: Record<string, unknown> = defaultValue;
  return {
    set: async (key: string, value: unknown) => {
      data[key] = value;
    },
    get: async (key: string) => data[key],
    delete: async (key: string) => {
      delete data[key];
    },
  };
};

export interface RemoteStorageInterface {
  set: (key: string, value: unknown) => Promise<void>;
  get: (key: string) => Promise<unknown>;
  delete: (key: string) => Promise<void>;
}

interface CreateStoreProviderOptions {
  actorName: string;
  storage?: RemoteStorageInterface;
  defaultValue?: Record<string, unknown>;
}

export function createRemoteStorageProvider(director: Director, opts: CreateStoreProviderOptions) {
  const { actorName, defaultValue } = opts;
  const { storage = createDefaultStorage(defaultValue) } = opts
  const actor = director.registerActor(actorName);
  const keysSubscribed: Record<string, string[]> = {};
  const localStore = {
    set: async (key: string, value: unknown) => {
      await storage.set(key, value);
      if (!keysSubscribed[key]) {
        return;
      }
      keysSubscribed[key].forEach((recp: string) => {
        actor.sendMessage(recp, {
          event: 'KEY_UPDATED',
          key,
          value,
        });
      });
    },
    get: async (key: string) => {
      const val = await storage.get(key);
      return val;
    },
    delete: async (key: string) => {
      await storage.delete(key);
    },
  };

  actor.onMessage((msgs) => {
    msgs.forEach(async (
      tmp,
    ) => {
      // TODO: just a workaround
      const msg = tmp as unknown as Message<{
        action: string,
        keys?: string[],
        key?: string,
        value?: unknown,
      }>;

      if (
        msg.payload.action === 'SUBSCRIBE_TO_KEYS'
        && msg.payload.keys
      ) {
        msg.payload.keys.forEach((key: string) => {
          if (!keysSubscribed[key]) {
            keysSubscribed[key] = [];
          }
          keysSubscribed[key].push(msg.sender);
        });
      }
      if (
        msg.payload.action === 'UNSUBSCRIBE_FROM_KEYS'
        && msg.payload.keys
      ) {
        msg.payload.keys.forEach((key: string) => {
          if (!keysSubscribed[key]) {
            return;
          }
          keysSubscribed[key] = keysSubscribed[key].filter((elem: string) => elem !== msg.sender);
        });
      }
      if (
        msg.payload.action === 'SET'
        && msg.payload.key
        && msg.payload.value !== undefined
      ) {
        localStore.set(msg.payload.key, msg.payload.value);
      }
      if (
        msg.payload.action === 'GET'
        && msg.payload.key
      ) {
        const resp = await localStore.get(msg.payload.key);
        actor.sendMessage(msg.sender, {
          event: 'GET_RETURN',
          value: resp,
        });
      }
    });
  });

  return localStore;
}

interface CreateStoreConsumerOptions {
  storeLocation: string;
}

export function createRemoteStorageConsumer(director: Director, opts: CreateStoreConsumerOptions) {
  const { storeLocation } = opts;
  const actorName = randomstring();
  const actor = director.registerActor(actorName);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let onUpdate = (key: string, val: unknown) => { };
  const obj = {
    onUpdate: (keys: string[], cb: (key: string, val: unknown) => void) => {
      onUpdate = cb;
      actor.sendMessage(storeLocation, {
        action: 'SUBSCRIBE_TO_KEYS',
        keys,
      });
      return () => {
        actor.sendMessage(storeLocation, {
          action: 'UNSUBSCRIBE_FROM_KEYS',
          keys,
        });
      };
    },
    get: async (key: string): Promise<unknown> => {
      const resp = await dispatch<{ value?: unknown }>(director, storeLocation, {
        action: 'GET',
        key,
      }, true);
      if (!resp) {
        return null;
      }
      return resp.payload.value;
    },
    set: async (key: string, value: unknown): Promise<void> => {
      actor.sendMessage(storeLocation, {
        action: 'SET',
        key,
        value,
      });
    },
  };

  actor.onMessage((msgs) => {
    msgs.forEach((tmp) => {
      // TODO: just a workaround
      const msg = tmp as unknown as Message<{ event: string, key: string, value: string }>;
      if (msg.payload.event === 'KEY_UPDATED') {
        onUpdate(msg.payload.key, msg.payload.value);
      }
    });
  });

  return obj;
}
