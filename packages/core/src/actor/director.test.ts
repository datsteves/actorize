import { createStore } from './store';
import { ActorizePlugin, createDirector } from './director';

describe('director', () => {
  it('basic registerActor and sendMessage', async () => {
    const store = createStore();
    const director = createDirector({
      store,
    });
    // @ts-expect-error for now ok
    const actor1 = director.registerActor('actor-1');
    // @ts-expect-error for now ok
    const actor2 = director.registerActor('actor-2');
    const mockfn = jest.fn();
    actor1.onMessage(mockfn);
    expect(mockfn).toBeCalledTimes(0);
    // @ts-expect-error for now ok
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
    // @ts-expect-error for now ok
    const actor1 = director.registerActor('actor-1');
    // @ts-expect-error for now ok
    const actor2 = director.registerActor('actor-2');
    const mockfn = jest.fn();
    actor1.onMessage(mockfn);
    expect(mockfn).toBeCalledTimes(0);
    // @ts-expect-error for now ok
    await actor2.sendMessage('otherthread.actor-1', 'hello');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockfn).toBeCalledTimes(0);
  });

  it('plugin system works', async () => {
    const store = createStore();
    const mockfnPlugin = jest.fn();
    const plugin: ActorizePlugin = {
      onMessage: (msg) => {
        mockfnPlugin(msg);
        return msg;
      },
    };
    const director = createDirector({
      store,
      plugins: [plugin],
    });
    // @ts-expect-error for now ok
    const actor1 = director.registerActor('actor-1');
    // @ts-expect-error for now ok
    const actor2 = director.registerActor('actor-2');
    // @ts-expect-error for now ok
    await actor2.sendMessage('actor-1', 'hello');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockfnPlugin).toBeCalledTimes(1);
    expect(mockfnPlugin).toBeCalledWith({ recipient: 'actor-1', payload: 'hello', sender: 'actor-2' });
  });
});
