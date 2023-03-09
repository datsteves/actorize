import createLogPlugin from './log';

describe('plugins:log', () => {
  it('works', () => {
    const mockfn = jest.fn();
    const plugin = createLogPlugin({
      logger: mockfn,
    });
    expect(mockfn).toHaveBeenCalledTimes(0);
    if (plugin.onMessage) {
      plugin.onMessage({
        payload: 'hello world',
        recipient: 'actor',
        sender: 'poster',
      });
    }
    expect(mockfn).toHaveBeenCalledTimes(1);
    expect(mockfn).toHaveBeenCalledWith('[ACTORIZE] (poster) => (actor)', 'hello world');
  });

  it('filter works', () => {
    const mockfn = jest.fn();
    const plugin = createLogPlugin({
      logger: mockfn,
      filter: (msg) => {
        if (msg.recipient === 'actor') {
          return false;
        }
        return true;
      },
    });
    expect(mockfn).toHaveBeenCalledTimes(0);
    if (plugin.onMessage) {
      plugin.onMessage({
        payload: 'hello world',
        recipient: 'actor',
        sender: 'poster',
      });
    }
    expect(mockfn).toHaveBeenCalledTimes(0);

    if (plugin.onMessage) {
      plugin.onMessage({
        payload: 'hello world',
        recipient: 'worker',
        sender: 'poster',
      });
    }
    expect(mockfn).toHaveBeenCalledTimes(1);
    expect(mockfn).toHaveBeenCalledWith('[ACTORIZE] (poster) => (worker)', 'hello world');
  });
});
