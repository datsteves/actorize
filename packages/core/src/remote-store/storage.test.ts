import { createRemoteStorageConsumer, createRemoteStorageProvider } from './index'
import {
  createDirector,
  createStore,
} from '../index';


describe('Remote Storage', () => {
  it('does remote storage work', async () => {

    const testValue = 'hello world'
    const testKey = 'key1'

    const director = createDirector({
      store: createStore(),
    });
    const prov = createRemoteStorageProvider(director, {
      actorName: 'test-storage',
    })

    const cons = createRemoteStorageConsumer(director, {
      storeLocation: 'test-storage'
    })
    const cb = jest.fn()
    cons.onUpdate([testKey], cb)
    const resp1 = await cons.get(testKey)
    expect(resp1).toBeUndefined()

    await cons.set(testKey, testValue)
    const resp2 = await cons.get(testKey)
    expect(resp2).toBe(testValue)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(cb.mock.calls.length).toBe(1)
    expect(cb.mock.calls[0][0]).toBe(testKey)
    expect(cb.mock.calls[0][1]).toBe(testValue)
  })
})
