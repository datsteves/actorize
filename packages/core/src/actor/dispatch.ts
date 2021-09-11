import { Message, RecipientAsI } from './store';
import { Director } from './director';
import { randomstring } from '../utils';

export async function dispatch<T extends RecipientAsI, K extends keyof RecipientAsI>(
  director: Director,
  recipient: K,
  payload: T[K],
  waitTillResponse = false,
): Promise<Message<T[K]> | undefined> {
  const randomActorName = randomstring();
  // @ts-expect-error for now its ok
  const actor = director.registerActor(randomActorName);
  let returnValue: undefined | Promise<Message<T[K]>>;
  if (waitTillResponse) {
    returnValue = new Promise((resolve) => {
      actor.onMessage((msgs) => {
        // TODO: just a workaround
        const msg = msgs[0] as unknown as Message<T[K]>;
        resolve(msg);
      });
    });
  }

  await actor.sendMessage(recipient, payload);

  return returnValue;
}

export default {};
