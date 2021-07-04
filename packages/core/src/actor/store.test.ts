import { createStore } from './store';

function skiploop() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('store.ts', () => {
  it('basic push and pop', async () => {
    const store = createStore();
    const first = await store.popMessages('test');
    expect(first.length).toBe(0);
    await store.pushMessage('test', { hello: 'world' }, 'not-existing');
    const second = await store.popMessages('test');
    expect(second.length).toBe(1);
    expect(second[0].payload).toEqual({ hello: 'world' });
  });
  it('should not get messages from other recipients with simple popMessage method', async () => {
    const store = createStore();
    const first = await store.popMessages('nothing-here');
    expect(first.length).toBe(0);
    await store.pushMessage('test', { hello: 'world' }, 'not-existing');
    const second = await store.popMessages('nothing-here');
    expect(second.length).toBe(0);
  });
  it('keep pop message', async () => {
    const store = createStore();
    await store.pushMessage('test', { hello: 'world' }, 'not-existing');
    const first = await store.popMessages('test', true);
    expect(first.length).toBe(1);
    expect(first[0].payload).toEqual({ hello: 'world' });

    const second = await store.popMessages('test', true);
    expect(second.length).toBe(1);
    expect(second[0].payload).toEqual({ hello: 'world' });
  });
  it('basic subscription', async () => {
    const store = createStore();
    const mockfn = jest.fn();
    store.subscribe('test', mockfn);
    expect(mockfn).toBeCalledTimes(0);
    await store.pushMessage('test', { hello: 'world' }, 'not-existing');
    await skiploop();
    expect(mockfn).toBeCalledTimes(1);
    expect(mockfn).toBeCalledWith([{ payload: { hello: 'world' }, recipient: 'test', sender: 'not-existing' }]);
  });

  it('should not get messages from other recipients within the subscription', async () => {
    const store = createStore();
    const mockfn = jest.fn();
    store.subscribe('nothing-here', mockfn);
    expect(mockfn).toBeCalledTimes(0);
    await store.pushMessage('test', { hello: 'world' }, 'not-existing');
    await skiploop();
    expect(mockfn).toBeCalledTimes(0);
  });
});
