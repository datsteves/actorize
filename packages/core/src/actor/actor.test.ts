import { createStore } from './store';
import { createActorFactory } from './actor';

describe('actor.ts', () => {
  it('basic onMessage and sendMessageToSelf', async () => {
    const store = createStore();
    const createActor = createActorFactory({ store });
    const actorName = 'test';
    // @ts-expect-error for now ok
    const actor = createActor(actorName);
    const mockfn = jest.fn();
    actor.onMessage(mockfn);
    expect(mockfn).toHaveBeenCalledTimes(0);
    // @ts-expect-error for now ok
    actor.sendMessageToSelf('hello');

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockfn).toHaveBeenCalledTimes(1);
    expect(mockfn).toHaveBeenCalledWith([
      { recipient: actorName, payload: 'hello', sender: actorName },
    ]);
  });
});
