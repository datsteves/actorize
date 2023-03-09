import { createStore, createDirector, createNetworkInterface, createRouter } from './index';

function skiploop(time = 0) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

describe('integration.test.ts', () => {
  it('basic same thread use case', async () => {
    const routerOneTwoLink = createNetworkInterface();
    const routerTwoOneLink = createNetworkInterface();

    routerOneTwoLink.handleLocalIncomingMessages((msg) => {
      routerTwoOneLink.sendLocal(msg);
    });

    routerTwoOneLink.handleLocalIncomingMessages((msg) => {
      routerOneTwoLink.sendLocal(msg);
    });

    const routerOne = createRouter({
      domains: {
        routerTwo: routerOneTwoLink,
      },
      ownDomain: 'routerOne',
    });

    const storeOne = createStore();
    const directorOne = createDirector({
      store: storeOne,
      routers: [routerOne],
    });

    // @ts-expect-error for now ok
    const actorOne = directorOne.registerActor('one');
    const mockfnOne = jest.fn();
    actorOne.onMessage(mockfnOne);

    const routerTwo = createRouter({
      domains: {
        routerOne: routerTwoOneLink,
      },
      ownDomain: 'routerTwo',
    });

    const storeTwo = createStore();
    const directorTwo = createDirector({
      store: storeTwo,
      routers: [routerTwo],
    });

    // @ts-expect-error for now ok
    const actorTwo = directorTwo.registerActor('two');
    const mockfnTwo = jest.fn();
    actorTwo.onMessage(mockfnTwo);
    expect(mockfnOne).toHaveBeenCalledTimes(0);
    expect(mockfnTwo).toHaveBeenCalledTimes(0);

    // @ts-expect-error for now ok
    actorTwo.sendMessage('routerOne.one', 'hello');
    await skiploop(100);

    expect(mockfnOne).toHaveBeenCalledTimes(1);
    expect(mockfnOne).toHaveBeenCalledWith([
      { recipient: 'one', payload: 'hello', sender: 'routerTwo.two' },
    ]);
    expect(mockfnTwo).toHaveBeenCalledTimes(0);

    // @ts-expect-error for now ok
    actorOne.sendMessage('routerTwo.two', 'hello');
    await skiploop(100);

    expect(mockfnTwo).toHaveBeenCalledTimes(1);
    expect(mockfnTwo).toHaveBeenCalledWith([
      { recipient: 'two', payload: 'hello', sender: 'routerOne.one' },
    ]);
  });

  it('basic same thread use case with 3 directors', async () => {
    const routerOneTwoLink = createNetworkInterface();
    const routerTwoOneLink = createNetworkInterface();

    routerOneTwoLink.handleLocalIncomingMessages((msg) => {
      routerTwoOneLink.sendLocal(msg);
    });

    routerTwoOneLink.handleLocalIncomingMessages((msg) => {
      routerOneTwoLink.sendLocal(msg);
    });

    const routerTwoThreeLink = createNetworkInterface();
    const routerThreeTwoLink = createNetworkInterface();

    routerTwoThreeLink.handleLocalIncomingMessages((msg) => {
      routerThreeTwoLink.sendLocal(msg);
    });

    routerThreeTwoLink.handleLocalIncomingMessages((msg) => {
      routerTwoThreeLink.sendLocal(msg);
    });

    const routerOne = createRouter({
      domains: {
        routerTwo: routerOneTwoLink,
        routerThree: routerOneTwoLink,
      },
      ownDomain: 'routerOne',
    });

    const routerTwo = createRouter({
      domains: {
        routerOne: routerTwoOneLink,
        routerThree: routerTwoThreeLink,
      },
      ownDomain: 'routerTwo',
    });

    const routerThree = createRouter({
      domains: {
        routerOne: routerThreeTwoLink,
      },
      ownDomain: 'routerThree',
    });

    const storeOne = createStore();
    const directorOne = createDirector({
      store: storeOne,
      routers: [routerOne],
    });

    const storeTwo = createStore();
    createDirector({
      store: storeTwo,
      routers: [routerTwo],
    });

    const storeThree = createStore();
    const directorThree = createDirector({
      store: storeThree,
      routers: [routerThree],
    });
    // @ts-expect-error for now ok
    const actorOne = directorOne.registerActor('one');
    // @ts-expect-error for now ok
    const actorThree = directorThree.registerActor('three');
    const mockfnThree = jest.fn();
    actorThree.onMessage(mockfnThree);
    expect(mockfnThree).toHaveBeenCalledTimes(0);
    // @ts-expect-error for now ok
    actorOne.sendMessage('routerThree.three', 'test');
    await skiploop(100);
    expect(mockfnThree).toHaveBeenCalledTimes(1);
  });
});
