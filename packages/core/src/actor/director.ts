import { Actor, createActorFactory } from './actor';
import {
  WatchableMessageStore, PossibleMessagePayload, Recipient, Message, RecipientAsI
} from './store';
// eslint-disable-next-line import/no-cycle
import { NetworkMessage, NetworkRouter } from '../network';

export interface Director {
  registerActor: <K extends keyof RecipientAsI>(name: K) => Actor<K, RecipientAsI>
}

export interface ActorizePlugin {
  onMessage?: (msg: Message) => Message,
}
interface CreateDirectorOptions {
  store: WatchableMessageStore,
  routers?: NetworkRouter[],
  plugins?: ActorizePlugin[],
}

function handleMessagePlugin(plugins: ActorizePlugin[], msg: Message): Message {
  let tmpMessage = msg;
  for (let i = 0; i < plugins.length; i += 1) {
    const plugin = plugins[i];
    if (plugin.onMessage) {
      tmpMessage = plugin.onMessage(tmpMessage);
    }
  }
  return tmpMessage;
}

function patchStoreWithPlugins(
  store: WatchableMessageStore,
  routers: NetworkRouter[],
  plugins: ActorizePlugin[],
): WatchableMessageStore {
  const pushMessage = async (
    recipient: Recipient,
    payload: PossibleMessagePayload,
    sender: string,
  ) => {
    const msg = handleMessagePlugin(plugins, {
      payload,
      recipient,
      sender,
    });
    const recipientParts = msg.recipient.split('.');
    const isLocal = recipientParts.length === 1;
    if (!isLocal) {
      const networkmsg: NetworkMessage = {
        domain: recipientParts[0],
        payload: {
          recipient: recipientParts[recipientParts.length - 1],
          payload: msg.payload,
          sender: msg.sender,
        },
      };
      // just match the first one that returns true
      routers.find((router) => {
        const success = router.handleIncomingMessage(networkmsg, store);
        return success;
      });
      return undefined;
    }
    return store.pushMessage(msg.recipient, msg.payload, msg.sender);
  };
  return {
    ...store,
    pushMessage,
  };
}

export function createDirector(options: CreateDirectorOptions): Director {
  const { store, routers = [], plugins = [] } = options;
  const patchedStore = patchStoreWithPlugins(store, routers, plugins);
  routers.forEach((router) => {
    router.interfaces.forEach((i) => {
      i.setLocalCallback((msg: NetworkMessage) => {
        const rx = msg.domain ? `${msg.domain}.${msg.payload.recipient}` : msg.payload.recipient;
        patchedStore.pushMessage(rx, msg.payload.payload, msg.payload.sender);
      });
    });
  });
  const createActor = createActorFactory({ store: patchedStore });

  const registerActor = <K extends keyof RecipientAsI>(name: K): Actor<K, RecipientAsI> => {
    const tmp = name as any as string
    const parts = tmp.split('.');
    const n = parts[parts.length - 1] as K;
    const actor = createActor(n);
    return actor;
  };
  return {
    registerActor,
  };
}
