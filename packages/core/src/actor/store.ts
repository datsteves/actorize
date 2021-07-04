// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RecipientAsI { }

// eslint-disable-next-line @typescript-eslint/ban-types
export type LiteralUnion<T extends U, U = string> = T | (U & {});
export type Recipient = LiteralUnion<keyof RecipientAsI>;

export type PossibleMessagePayload
  = RecipientAsI[keyof RecipientAsI] extends never ? unknown : RecipientAsI[keyof RecipientAsI];

export interface Message<T = PossibleMessagePayload> {
  recipient: Recipient;
  payload: T;
  sender: string;
}
export interface WatchableMessageStore {
  popMessages: (recipient: Recipient, keepMessage?: boolean) => Promise<Message[]>
  pushMessage:
  (recipient: Recipient, payload: PossibleMessagePayload, sender: string) => Promise<void>
  subscribe: (recipient: Recipient, callback: (msg: Message[]) => void) => () => void
}

export function createStore() {
  let messages: Message[] = [];
  const callbacks: Record<string, () => void> = {};

  const popMessages = async (recipient: Recipient, keepMessage = false) => {
    const relevantMessages = messages.filter((e) => e.recipient === recipient || recipient === '*');
    if (!keepMessage) {
      messages = messages.filter((e) => !(e.recipient === recipient || recipient === '*'));
    }
    return relevantMessages;
  };

  const pushMessage = async (
    recipient: Recipient,
    payload: PossibleMessagePayload,
    sender: string,
  ) => {
    messages.push({
      recipient,
      payload,
      sender,
    });
    if (typeof callbacks[recipient] === 'function') {
      setTimeout(() => {
        callbacks[recipient]();
      }, 0);
    }
  };

  const subscribe = (recipient: Recipient, callback: (msg: Message[]) => void) => {
    const cb = async () => {
      const msgs = await popMessages(recipient);
      if (msgs.length) {
        callback(msgs);
      }
    };
    callbacks[recipient] = cb;
    return () => {
      delete callbacks[recipient];
    };
  };

  return {
    pushMessage,
    popMessages,
    subscribe,
  };
}
