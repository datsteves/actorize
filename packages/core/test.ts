import { createDirector, createStore, dispatch } from './src'

declare module './src/actor/store' {
  interface RecipientAsI {
    test: {
      test: 'test',
    };
    test23: {
      test: 'hello',
    };
  }
}

const d = createDirector({
  'store': createStore(),
})

const a = d.registerActor('test234')

dispatch(d, 'test', {})
