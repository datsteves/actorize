import { createStore, createDirector, createNetworkInterface, createRouter } from './index'

function skiploop(time = 0) {
  return new Promise(resolve => setTimeout(resolve, time))
}

describe('integration.test.ts', () => {
  it('basic same thread use case', async () => {


    const routerOneTwoLink = createNetworkInterface()
    const routerTwoOneLink = createNetworkInterface()

    routerOneTwoLink.handleLocalIncomingMessages((msg) => {
      routerTwoOneLink.sendLocal(msg)
    })

    routerTwoOneLink.handleLocalIncomingMessages((msg) => {
      routerOneTwoLink.sendLocal(msg)
    })

    const routerOne = createRouter({
      domains: {
        routerTwo: routerOneTwoLink
      },
      ownDomain: 'routerOne'
    })

    const storeOne = createStore()
    const directorOne = createDirector({
      store: storeOne,
      routers: [routerOne]
    })

    const actorOne = directorOne.registerActor('one')
    const mockfnOne = jest.fn()
    actorOne.onMessage(mockfnOne)







    const routerTwo = createRouter({
      domains: {
        routerOne: routerTwoOneLink
      },
      ownDomain: 'routerTwo'
    })

    const storeTwo = createStore()
    const directorTwo = createDirector({
      store: storeTwo,
      routers: [routerTwo]
    })

    const actorTwo = directorTwo.registerActor('two')
    const mockfnTwo = jest.fn()
    actorTwo.onMessage(mockfnTwo)
    expect(mockfnOne).toBeCalledTimes(0)
    expect(mockfnTwo).toBeCalledTimes(0)

    actorTwo.sendMessage('routerOne.one', 'hello')
    await skiploop(100)

    expect(mockfnOne).toBeCalledTimes(1)
    expect(mockfnOne).toBeCalledWith([{ recipient: 'one', payload: 'hello', sender: 'routerTwo.two' }])
    expect(mockfnTwo).toBeCalledTimes(0)

    actorOne.sendMessage('routerTwo.two', 'hello')
    await skiploop(100)

    expect(mockfnTwo).toBeCalledTimes(1)
    expect(mockfnTwo).toBeCalledWith([{ recipient: 'two', payload: 'hello', sender: 'routerOne.one' }])

  })

  it('basic same thread use case with 3 directors', async () => {


    const routerOneTwoLink = createNetworkInterface()
    const routerTwoOneLink = createNetworkInterface()

    routerOneTwoLink.handleLocalIncomingMessages((msg) => {
      routerTwoOneLink.sendLocal(msg)
    })

    routerTwoOneLink.handleLocalIncomingMessages((msg) => {
      routerOneTwoLink.sendLocal(msg)
    })



    const routerTwoThreeLink = createNetworkInterface()
    const routerThreeTwoLink = createNetworkInterface()

    routerTwoThreeLink.handleLocalIncomingMessages((msg) => {
      routerThreeTwoLink.sendLocal(msg)
    })

    routerThreeTwoLink.handleLocalIncomingMessages((msg) => {
      routerTwoThreeLink.sendLocal(msg)
    })

    const routerOne = createRouter({
      domains: {
        routerTwo: routerOneTwoLink,
        routerThree: routerOneTwoLink
      },
      ownDomain: 'routerOne'
    })

    const routerTwo = createRouter({
      domains: {
        routerOne: routerTwoOneLink,
        routerThree: routerTwoThreeLink
      },
      ownDomain: 'routerTwo'
    })

    const routerThree = createRouter({
      domains: {
        routerOne: routerThreeTwoLink
      },
      ownDomain: 'routerThree'
    })

    const storeOne = createStore()
    const directorOne = createDirector({
      store: storeOne,
      routers: [routerOne]
    })


    const storeTwo = createStore()
    const directorTwo = createDirector({
      store: storeTwo,
      routers: [routerTwo]
    })

    const storeThree = createStore()
    const directorThree = createDirector({
      store: storeThree,
      routers: [routerThree]
    })
    const actorOne = directorOne.registerActor('one')
    const actorThree = directorThree.registerActor('three')
    const mockfnThree = jest.fn()
    actorThree.onMessage(mockfnThree)
    expect(mockfnThree).toBeCalledTimes(0)
    actorOne.sendMessage('routerThree.three', 'test')
    await skiploop(100)
    expect(mockfnThree).toBeCalledTimes(1)
  })

})
