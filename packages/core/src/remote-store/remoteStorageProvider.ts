// eslint-disable-next-line import/no-cycle
import { Director, dispatch, Message } from '../index';
import { randomstring } from '../utils';
import createDefaultStorage, { RemoteStorageInterface } from './defaultStorage'



interface CreateStoreProviderOptions {
  actorName: string;
  storage?: RemoteStorageInterface;
  defaultValue?: Record<string, unknown>;
}

function createRemoteStorageProvider(director: Director, opts: CreateStoreProviderOptions) {
  const { actorName, defaultValue } = opts;
  const { storage = createDefaultStorage(defaultValue) } = opts;
  // @ts-expect-error for now ok
  const actor = director.registerActor(actorName);
  const keysSubscribed: Record<string, string[]> = {};
  const localStore = {
    set: async (key: string, value: unknown) => {
      await storage.set(key, value);
      if (!keysSubscribed[key]) {
        return;
      }
      keysSubscribed[key].forEach((recp: string) => {
        // @ts-expect-error for now ok
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
        // @ts-expect-error for now ok
        actor.sendMessage(msg.sender, {
          event: 'GET_RETURN',
          value: resp,
        });
      }
    });
  });

  return localStore;
}

export default createRemoteStorageProvider
