# @actorize/core
[![gzip size](https://badgen.net/bundlephobia/minzip/@actorize/core)]()

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

## Plugin System

the most basic plugin is the logging plugin. This can be helpful to see when what actor send what.
```javascript
import { createDirector, createStore, createLogPlugin } from '@actorize/core'

 // logs into 'debug' with "[ACTORIZE] ({{sender}}) => ({{recipient}}), {{payload}}"
const logPlugin = createLogPlugin()

// you have the option to filter too.
// this would only log messages from the actor named "ui"
// createLogPlugin({ filter: (msg) => msg.sender === 'ui'  })

const director = createDirector({
  store: createStore(),
  plugins: [logPlugin]
})
```

A plugin in general can be used to transform messages before they are saved to the store too. At the moment it just as options for `onMessage` which gets a `Message` and has to return a `Message`.
The Typescript interface for the Plugin is
```typescript
interface ActorizePlugin {
  onMessage?: (msg: Message) => Message,
}
```
