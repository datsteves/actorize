import { PossibleMessagePayload, Message, Recipient } from './store';
// eslint-disable-next-line import/no-cycle
import { Director } from './director';
import { randomstring } from '../utils';

export async function dispatch<T = unknown>(
  director: Director,
  recipient: Recipient,
  payload: PossibleMessagePayload,
  waitTillResponse = false,
): Promise<Message<T> | undefined> {
  const randomActorName = randomstring();
  const actor = director.registerActor(randomActorName);
  let returnValue: undefined | Promise<Message<T>>;
  if (waitTillResponse) {
    returnValue = new Promise((resolve) => {
      actor.onMessage((msgs) => {
        // TODO: just a workaround
        const msg = msgs[0] as unknown as Message<T>;
        resolve(msg);
      });
    });
  }

  await actor.sendMessage(recipient, payload);

  return returnValue;
}

export default {};
