import { createDirector, createStore, dispatch } from './src'

declare module './src/actor/store' {
  interface RecipientAsI {
    test: {
      test: 'test',
    };
    'ui.test23': {
      test2: 'hello',
    };
    't': 'test';
    // [key: string]: any;
}

const d = createDirector({
  store: createStore(),
})

const a = d.registerActor('')

// a.sendMessage('')

dispatch(d, 'ui.test23', { test2: 'hello' })
