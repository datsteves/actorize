import { createDirector, createStore, dispatch } from './src'

declare module './src/actor/store' {
  interface RecipientAsI {
    test: any;
    test23: any;
  }
}

const d = createDirector({
  'store': createStore(),
})

const a = d.registerActor('test234')

dispatch(d, 'test', 'test')
