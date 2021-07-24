// eslint-disable-next-line import/no-cycle
import { Director, dispatch, Message } from '../index';
import { randomstring } from '../utils';

interface CreateStoreConsumerOptions {
  storeLocation: string;
}

function createRemoteStorageConsumer<
  T extends Record<string, any>,
>(director: Director, opts: CreateStoreConsumerOptions) {
  const { storeLocation } = opts;
  const actorName = randomstring();
  // @ts-expect-error for now ok
  const actor = director.registerActor(actorName);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let onUpdate = (key: keyof T, val: T[keyof T]) => { };
  const obj = {
    onUpdate: (keys: (keyof T)[], cb: (key: keyof T, val: T[keyof T]) => void) => {
      onUpdate = cb;
      // @ts-expect-error for now ok
      actor.sendMessage(storeLocation, {
        action: 'SUBSCRIBE_TO_KEYS',
        keys,
      });
      return () => {
        // @ts-expect-error for now ok
        actor.sendMessage(storeLocation, {
          action: 'UNSUBSCRIBE_FROM_KEYS',
          keys,
        });
      };
    },
    get: async <K extends keyof T>(key: K): Promise<T[K] | null | undefined> => {
      // @ts-expect-error for now ok
      const resp = await dispatch(director, storeLocation, {
        action: 'GET',
        key,
      }, true);
      if (!resp) {
        return null;
      }
      // @ts-expect-error for now ok
      return resp.payload.value;
    },
    set: async <K extends keyof T>(key: K, value: T[K]): Promise<void> => {
      // @ts-expect-error for now ok
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
      const msg = tmp as unknown as Message<{ event: string, key: keyof T, value: T[keyof T] }>;
      if (msg.payload.event === 'KEY_UPDATED') {
        onUpdate(msg.payload.key, msg.payload.value);
      }
    });
  });

  return obj;
}

export default createRemoteStorageConsumer;
