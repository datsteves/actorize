import { createNetworkInterface, createRouter } from './index'
import { createStore } from '../index'

function skiploop() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('network/index.ts', () => {
  it('send av.', async () => {
    const store = createStore()
    const networkInterface = createNetworkInterface()

    const mockFn = jest.fn();

    networkInterface.handleLocalIncomingMessages(mockFn)

    const router = createRouter({
      ownDomain: 'local',
      domains: {
        other: networkInterface,
      }
    })
    const msg = {
      domain: 'other',
      payload: {
        sender: 'test',
        payload: 'hello',
        recipient: 'test2',
      }
    }
    expect(mockFn).toBeCalledTimes(0)
    const success = router.handleIncomingMessage(msg, store)
    expect(success).toBe(true)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith({
      ...msg,
      payload: {
        ...msg.payload,
        sender: 'local.test'
      }
    })
  })

  it('send not av.', async () => {
    const store = createStore()
    const networkInterface = createNetworkInterface()

    const mockFn = jest.fn();

    networkInterface.handleLocalIncomingMessages(mockFn)

    const router = createRouter({
      ownDomain: 'local',
      domains: {
        other: networkInterface,
      }
    })
    const msg = {
      domain: 'testdomain',
      payload: {
        sender: '',
        payload: 'hello',
        recipient: '',
      }
    }
    expect(mockFn).toBeCalledTimes(0)
    const success = router.handleIncomingMessage(msg, store)
    expect(success).toBe(false)
    expect(mockFn).toBeCalledTimes(0)
  })

  it('local', async () => {
    const store = createStore()
    const networkInterface = createNetworkInterface()

    const mockFn = jest.fn();

    networkInterface.setLocalCallback(mockFn)

    networkInterface.handleLocalIncomingMessages((msg) => {
      networkInterface.sendLocal(msg)
    })

    const router = createRouter({
      ownDomain: 'local',
      domains: {
        other: networkInterface,
      }
    })
    const msg = {
      domain: 'other',
      payload: {
        sender: 'test',
        payload: 'hello',
        recipient: 'test2',
      }
    }
    expect(mockFn).toBeCalledTimes(0)
    const success = router.handleIncomingMessage(msg, store)
    expect(success).toBe(true)
    expect(mockFn).toBeCalledTimes(1)
    expect(mockFn).toBeCalledWith({
      ...msg,
      payload: {
        ...msg.payload,
        sender: 'local.test'
      }
    })
  })
})
