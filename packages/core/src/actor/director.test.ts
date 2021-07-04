import { createStore } from './store';
import { createDirector } from './director';

describe('director', () => {
  it('basic registerActor and sendMessage', async () => {
    const store = createStore();
    const director = createDirector({
      store,
    });
    const actor1 = director.registerActor('actor-1');
    const actor2 = director.registerActor('actor-2');
    const mockfn = jest.fn();
    actor1.onMessage(mockfn);
    expect(mockfn).toBeCalledTimes(0);
    await actor2.sendMessage('actor-1', 'hello');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockfn).toBeCalledTimes(1);
    expect(mockfn).toBeCalledWith([{ recipient: 'actor-1', payload: 'hello', sender: 'actor-2' }]);
  });

  it('message with non local address should be blocked when no route', async () => {
    const store = createStore();
    const director = createDirector({
      store,
    });
    const actor1 = director.registerActor('actor-1');
    const actor2 = director.registerActor('actor-2');
    const mockfn = jest.fn();
    actor1.onMessage(mockfn);
    expect(mockfn).toBeCalledTimes(0);
    await actor2.sendMessage('otherthread.actor-1', 'hello');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockfn).toBeCalledTimes(0);
  });
});
