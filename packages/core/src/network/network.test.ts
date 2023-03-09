import { createNetworkInterface, createRouter } from './index';
import { createStore } from '../index';

describe('network/index.ts', () => {
  it('send av.', async () => {
    const store = createStore();
    const networkInterface = createNetworkInterface();

    const mockFn = jest.fn();

    networkInterface.handleLocalIncomingMessages(mockFn);

    const router = createRouter({
      ownDomain: 'local',
      domains: {
        other: networkInterface,
      },
    });
    const msg = {
      domain: 'other',
      payload: {
        sender: 'test',
        payload: 'hello',
        recipient: 'test2',
      },
    };
    expect(mockFn).toHaveBeenCalledTimes(0);
    const success = router.handleIncomingMessage(msg, store);
    expect(success).toBe(true);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith({
      ...msg,
      payload: {
        ...msg.payload,
        sender: 'local.test',
      },
    });
  });

  it('send not av.', async () => {
    const store = createStore();
    const networkInterface = createNetworkInterface();

    const mockFn = jest.fn();

    networkInterface.handleLocalIncomingMessages(mockFn);

    const router = createRouter({
      ownDomain: 'local',
      domains: {
        other: networkInterface,
      },
    });
    const msg = {
      domain: 'testdomain',
      payload: {
        sender: '',
        payload: 'hello',
        recipient: '',
      },
    };
    expect(mockFn).toHaveBeenCalledTimes(0);
    const success = router.handleIncomingMessage(msg, store);
    expect(success).toBe(false);
    expect(mockFn).toHaveBeenCalledTimes(0);
  });

  it('local', async () => {
    const store = createStore();
    const networkInterface = createNetworkInterface();

    const mockFn = jest.fn();

    networkInterface.setLocalCallback(mockFn);

    networkInterface.handleLocalIncomingMessages((msg) => {
      networkInterface.sendLocal(msg);
    });

    const router = createRouter({
      ownDomain: 'local',
      domains: {
        other: networkInterface,
      },
    });
    const msg = {
      domain: 'other',
      payload: {
        sender: 'test',
        payload: 'hello',
        recipient: 'test2',
      },
    };
    expect(mockFn).toHaveBeenCalledTimes(0);
    const success = router.handleIncomingMessage(msg, store);
    expect(success).toBe(true);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith({
      ...msg,
      payload: {
        ...msg.payload,
        sender: 'local.test',
      },
    });
  });
});
