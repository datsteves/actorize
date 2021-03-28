import { Message, WatchableMessageStore } from '../actor/store'

export interface NetworkMessage {
  domain: string;
  payload: Message;
}

export interface NetworkInterface {
  sendLocal: (msg: NetworkMessage) => void;
  sendOutbound: (msg: NetworkMessage) => void;
  handleLocalIncomingMessages: (cb: (msg: NetworkMessage) => void) => void;
  setLocalCallback: (cb: (msg: NetworkMessage) => void) => void;
}

export interface NetworkRouter {
  handleIncomingMessage: (msg: NetworkMessage, store: WatchableMessageStore) => boolean;
  interfaces: NetworkInterface[];
  ownDomain: string;
}

export const createNetworkInterface = (): NetworkInterface => {
  const callbacks: any[] = []
  let localCallback: (msg: NetworkMessage) => void = () => { }
  return {
    sendLocal: (msg) => {
      localCallback(msg)
    },
    sendOutbound: (msg) => {
      callbacks.forEach(cb => {
        cb(msg)
      })
    },
    handleLocalIncomingMessages: (cb) => {
      callbacks.push(cb)
    },
    setLocalCallback: (cb) => {
      localCallback = cb
    }
  }
}

interface CreateRouterArgs {
  ownDomain: string;
  domains: Record<string, NetworkInterface>
}


export const createRouter = (args: CreateRouterArgs): NetworkRouter => {
  const interfaces: NetworkInterface[] = []
  Object.keys(args.domains).forEach(key => {
    const i = args.domains[key]
    // prevent duplication
    if (interfaces.indexOf(i) === -1) {
      interfaces.push(i)
    }

  })
  const handleIncomingMessage = (msg: NetworkMessage, store: WatchableMessageStore): boolean => {
    if (msg.domain === args.ownDomain) {
      store.pushMessage(msg.payload.recipient, msg.payload.payload, msg.payload.sender)
      return true
    }
    if (!args.domains[msg.domain]) {
      return false;
    }
    const senderParts = msg.payload.sender.split('.')
    const isLocalSender = senderParts.length === 1;
    let sender = msg.payload.sender
    if (isLocalSender) {
      sender = `${args.ownDomain}.${sender}`
    }
    args.domains[msg.domain].sendOutbound({
      ...msg,
      payload: {
        ...msg.payload,
        sender,
      }
    })
    return true
  }

  return {
    handleIncomingMessage,
    interfaces,
    ownDomain: args.ownDomain,
  }
}

