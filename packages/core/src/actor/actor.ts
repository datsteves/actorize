import { Message, PossibleMessagePayload, WatchableMessageStore, Recipient } from './store'

export interface Actor {
  onMessage: (cb: (msgs: Message[]) => void) => () => void
  sendMessage: (recipient: Recipient, payload: PossibleMessagePayload) => Promise<void>
  sendMessageToSelf: (payload: PossibleMessagePayload) => Promise<void>
}

interface CreateActorDependecies {
  store: WatchableMessageStore
}

function createActor(deps: CreateActorDependecies, name: Recipient): Actor {
  const onMessage = (cb: (msgs: Message[]) => void) => {
    const unsub = deps.store.subscribe(name, cb)
    return unsub
  }
  const sendMessage = async (recipient: Recipient, payload: PossibleMessagePayload) => {
    return deps.store.pushMessage(recipient, payload, name)
  }
  const sendMessageToSelf = async (payload: PossibleMessagePayload) => {
    return deps.store.pushMessage(name, payload, name)
  }
  return {
    onMessage,
    sendMessage,
    sendMessageToSelf,
  }
}

export function createActorFactory(deps: CreateActorDependecies): (name: Recipient) => Actor {
  return createActor.bind(null, deps)
}
