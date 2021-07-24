import {
  Message, PossibleMessagePayload, WatchableMessageStore, Recipient, RecipientAsI,
} from './store';

export interface Actor<K extends keyof RecipientAsI, T extends RecipientAsI> {
  onMessage: (cb: (msgs: Message[]) => void) => () => void
  sendMessage: <S extends keyof RecipientAsI>(recipient: S, payload: T[S]) => Promise<void>
  sendMessageToSelf: (payload: T[K]) => Promise<void>
}

interface CreateActorDependecies {
  store: WatchableMessageStore
}

function createActor<K extends keyof RecipientAsI, T extends RecipientAsI>(deps: CreateActorDependecies, name: K): Actor<K, T> {
  const onMessage = (cb: (msgs: Message[]) => void) => {
    const unsub = deps.store.subscribe(name, cb);
    return unsub;
  };
  const sendMessage = async <S extends keyof RecipientAsI>(
    recipient: S ,
    payload: T[S],
  ) => deps.store.pushMessage(recipient, payload, name);
  const sendMessageToSelf = async(
    payload: T[K],
  ) => deps.store.pushMessage(name, payload, name);
  return {
    onMessage,
    sendMessage,
    sendMessageToSelf,
  };
}

export function createActorFactory<K extends keyof RecipientAsI>(deps: CreateActorDependecies): (name: K) => Actor<K,RecipientAsI> {
  return createActor.bind(null, deps);
}
