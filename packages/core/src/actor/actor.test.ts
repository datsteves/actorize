import { createStore } from './store';
import { createActorFactory } from './actor';

describe('actor.ts', () => {
  it('basic onMessage and sendMessageToSelf', async () => {
    const store = createStore();
    const createActor = createActorFactory({ store });
    const actorName = 'test';
    const actor = createActor(actorName);
    const mockfn = jest.fn();
    actor.onMessage(mockfn);
    expect(mockfn).toBeCalledTimes(0);
    actor.sendMessageToSelf('hello');

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockfn).toBeCalledTimes(1);
    expect(mockfn).toBeCalledWith([{ recipient: actorName, payload: 'hello', sender: actorName }]);
  });
});
