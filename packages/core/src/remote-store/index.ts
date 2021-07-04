import { Director, dispatch } from '../index'
import { randomstring } from '../utils'

const createDefaultStorage = () => {
  const data: Record<string, any> = {}
  return {
    set: async (key: string, value: any) => {
      data[key] = value
    },
    get: async (key: string) => {
      return data[key]
    },
    delete: async (key: string) => {
      delete data[key]
    },
  }
}

export interface RemoteStorageInterface {
  set: (key: string, value: any) => Promise<void>;
  get: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
}

interface CreateStoreProviderOptions {
  actorName: string;
  storage?: RemoteStorageInterface;
}

export function createRemoteStorageProvider(director: Director, opts: CreateStoreProviderOptions) {
  const { actorName, storage = createDefaultStorage() } = opts
  const actor = director.registerActor(actorName)
  const keysSubscribed: Record<string, any> = {}
  const localStore = {
    set: async (key: string, value: any) => {
      await storage.set(key, value)
      if (!keysSubscribed[key]) {
        return
      }
      keysSubscribed[key].forEach((recp: string) => {
        actor.sendMessage(recp, {
          event: 'KEY_UPDATED',
          key,
          value,
        })
      })
    },
    get: async (key: string) => {
      const val = await storage.get(key)
      return val
    },
    delete: async (key: string) => {
      await storage.delete(key)
    }
  }

  actor.onMessage((msgs) => {
    msgs.forEach(async (msg) => {
      if (msg.payload.action === 'SUBSCRIBE_TO_KEYS') {
        msg.payload.keys.forEach((key: string) => {
          if (!keysSubscribed[key]) {
            keysSubscribed[key] = []
          }
          keysSubscribed[key].push(msg.sender)
        })
      }
      if (msg.payload.action === 'UNSUBSCRIBE_FROM_KEYS') {
        msg.payload.keys.forEach((key: string) => {
          if (!keysSubscribed[key]) {
            return
          }
          keysSubscribed[key] = keysSubscribed[key].filter((elem: string) => elem !== msg.sender)
        })
      }
      if (msg.payload.action === 'SET') {
        localStore.set(msg.payload.key, msg.payload.value)
      }
      if (msg.payload.action === 'GET') {
        const resp = await localStore.get(msg.payload.key)
        actor.sendMessage(msg.sender, {
          event: 'GET_RETURN',
          value: resp,
        })
      }
    })
  })

  return localStore
}

interface CreateStoreConsumerOptions {
  storeLocation: string;
}

export function createRemoteStorageConsumer(director: Director, opts: CreateStoreConsumerOptions) {
  const { storeLocation } = opts
  const actorName = randomstring()
  const actor = director.registerActor(actorName)
  let onUpdate = (key: string, val: any) => { }
  const obj = {
    onUpdate: (keys: string[], cb: (key: string, val: any) => void) => {
      onUpdate = cb
      actor.sendMessage(storeLocation, {
        action: 'SUBSCRIBE_TO_KEYS',
        keys,
      })
      return () => {
        actor.sendMessage(storeLocation, {
          action: 'UNSUBSCRIBE_FROM_KEYS',
          keys,
        })
      }
    },
    get: async (key: string): Promise<any> => {
      const resp = await dispatch(director, storeLocation, {
        action: 'GET',
        key,
      }, true)
      if (!resp) {
        return null
      }
      return resp.payload.value
    },
    set: async (key: string, value: any): Promise<void> => {
      actor.sendMessage(storeLocation, {
        action: 'SET',
        key,
        value,
      })
    }
  }

  actor.onMessage((msgs) => {
    msgs.forEach((msg) => {
      if (msg.payload.event === 'KEY_UPDATED') {
        onUpdate(msg.payload.key, msg.payload.value)
      }
    })
  })

  return obj
}
