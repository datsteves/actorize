export interface RecipientAsI { }

export type LiteralUnion<T extends U, U = string> = T | (U & {});
export type Recipient = LiteralUnion<keyof RecipientAsI>

export type PossibleMessagePayload = RecipientAsI[keyof RecipientAsI] extends never ? any : RecipientAsI[keyof RecipientAsI]


export interface Message {
  recipient: Recipient;
  payload: PossibleMessagePayload;
  sender: string;
}
export interface WatchableMessageStore {
  popMessages: (recipient: Recipient, keepMessage?: boolean) => Promise<Message[]>
  pushMessage: (recipient: Recipient, payload: PossibleMessagePayload, sender: string) => Promise<void>
  subscribe: (recipient: Recipient, callback: (msg: Message[]) => void) => () => void
}

export function createStore() {
  let messages: Message[] = []
  const callbacks: Record<string, any> = {}


  const popMessages = async (recipient: Recipient, keepMessage = false) => {
    const relevantMessages = messages.filter(e => {
      return e.recipient === recipient || recipient === '*'
    })
    if (!keepMessage) {
      messages = messages.filter(e => {
        return !(e.recipient === recipient || recipient === '*')
      })
    }
    return relevantMessages
  }

  const pushMessage = async (recipient: Recipient, payload: PossibleMessagePayload, sender: string) => {
    messages.push({
      recipient,
      payload,
      sender,
    })
    if (callbacks[recipient]) {
      setTimeout(callbacks[recipient], 0)
    }
  }

  const subscribe = (recipient: Recipient, callback: (msg: Message[]) => void) => {
    let timeout = -1
    const cb = async () => {
      const msgs = await popMessages(recipient)
      if (msgs.length) {
        callback(msgs)
      }

      // timeout = setTimeout(cb, 50)
    }
    callbacks[recipient] = cb
    // timeout = setTimeout(cb, 50)
    return () => {
      // self.clearTimeout(timeout)
      delete callbacks[recipient]
    }
  }

  return {
    pushMessage,
    popMessages,
    subscribe,
  }
}
