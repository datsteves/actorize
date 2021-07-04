import { Actor, createActorFactory } from './actor'
import { WatchableMessageStore, PossibleMessagePayload, Recipient } from './store'
import { NetworkMessage, NetworkRouter } from '../network'

export interface Director {
  registerActor: (name: Recipient) => Actor
}

interface CreateDirectorOptions {
  store: WatchableMessageStore,
  routers?: NetworkRouter[]
}

function patchStoreWithPlugins(store: WatchableMessageStore, routers: NetworkRouter[]): WatchableMessageStore {
  const pushMessage = async (recipient: Recipient, payload: PossibleMessagePayload, sender: string) => {
    const recipientParts = recipient.split('.')
    const isLocal = recipientParts.length === 1;
    if (!isLocal) {
      const networkmsg: NetworkMessage = {
        domain: recipientParts[0],
        payload: {
          recipient: recipientParts[recipientParts.length - 1],
          payload,
          sender,
        },
      }
      // just match the first one that returns true
      routers.find(router => {
        const success = router.handleIncomingMessage(networkmsg, store)
        return success
      })
      return
    }
    return store.pushMessage(recipient, payload, sender)
  }
  return {
    ...store,
    pushMessage,
  }
}

export function createDirector(options: CreateDirectorOptions): Director {
  const { store, routers = [] } = options
  const patchedStore = patchStoreWithPlugins(store, routers)
  routers.forEach(router => {
    router.interfaces.forEach(i => {
      i.setLocalCallback((msg: NetworkMessage) => {
        const rx = msg.domain ? `${msg.domain}.${msg.payload.recipient}` : msg.payload.recipient
        patchedStore.pushMessage(rx, msg.payload.payload, msg.payload.sender)
      })
    })
  })
  const createActor = createActorFactory({ store: patchedStore })

  const registerActor = (name: Recipient): Actor => {
    const actor = createActor(name)
    return actor
  }
  return {
    registerActor
  }
}
