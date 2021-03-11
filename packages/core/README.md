# @actorize/core

## Getting Started

```bash
$ npm install @actorize/core
# or
$ yarn add @actorize/core
```

```javascript
import {
  createDirector,
  createStore,
} from '@actorize/core';

const director = createDirector({
  store: createStore(),
});

const actorOne = director.registerActor('one');
actorOne.onMessage((msgs) => {
  if (msgs[0].payload === 'DO_SOMETHING') {
    console.log('I DID SOMETHING');
  }
});

const actorTwo = director.registerActor('two');
actorTwo.sendMessage('one', 'DO_SOMETHING');
```
