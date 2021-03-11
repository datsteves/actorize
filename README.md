# Actorize
Is a package that helps you to split up components into multile actors, that can talk to each other, without knowing where those actors are. can be useful for:
- send files into a webworker to upload it there and get events how far it is
- long running tasks and their state changes over time that needs to be reflected in the ui
- Clicking on a Button should open a General Modal that can be openend in multiple ways, like a command palette.

if you don't know why this can be really nice to have then here is a [talk from Paul Lewis and Surma](https://www.youtube.com/watch?v=Vg60lf92EkM&ab_channel=GoogleChromeDevelopers) where they explain where the idea comes from and what benefits it brings. The whole idea of this package actually started with that talk and being frustrated in some projects that i just couldn't toggle a state somewhere in the app without doing a global state in redux or mobx. Especially if you are doing things via multiple threads like a button sends an event to a worker_thread that was started in the electron main thread, Redux/Mobx wouldn't be an option anyways.

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


## React

```bash
$ npm install @actorize/react
# or
$ yarn add @actorize/react
```


```javascript
import { ActorizeProvider, useActorize } from '@actorize/react';
import {
  dispatch
} from '@actorize/core';
import director from './director';
// ...

const MyCoolActor = () => {
  const [state, setState] = useSate(0)

  const actor = useActorize('cool-actor', {
    onMessage: (msg) => {
      if (msg.payload === 'INC') {
        setState(state + 1)
      }
    },
  });

  return (
    <div>
      {state}
    </div>
  )
}

const ThatBigButton = () => {
  const handleClick = () => {
    dispatch(director, 'cool-actor', 'INC');
  }
  return (
    <button onClick={handleClick} >Click Me</button>
  )
}

const Wrapper = () => (
  <ActorizeProvider director={director}>
    <MyCoolActor />
    <ThatBigButton />
  </ActorizeProvider>
)

```

## Working with Threads

```javascript
// ui.js
import {
  createDirector,
  createRouter,
  createStore,
  createNetworkInterface,
} from '@actorize/core';

const myWorker = new Worker("/worker.js");
const workerInterface = createNetworkInterface();

myWorker.onmessage = (arg) => {
  workerInterface.sendLocal(arg.data);
};
workerInterface.handleLocalIncomingMessages((msg) => {
  myWorker.postMessage(msg);
});

const router = createRouter({
  ownDomain: 'ui',
  domains: {
    upload: workerInterface,
    ...optional,
  },
});

export const director = createDirector({
  store: createStore(),
  routers: [router],
});


// worker.js

import {
  createDirector,
  createStore,
  createWorkerInterface,
  createRouter,
} from '@actorize/core';

const ni = createNetworkInterface();

// @ts-expect-error custom
self.onmessage = (arg) => {
  ni.sendLocal(arg.data);
};
ni.handleLocalIncomingMessages((msg) => {
  // @ts-expect-error custom
  self.postMessage(msg);
});


const router = createRouter({
  ownDomain: 'test-worker',
  domains: {
    ui: ni,
  },
});

const director = createDirector({
  store: createStore(),
  routers: [router],
});

const actor = director.registerActor('worker-actor');

actor.onMessage((msgs) => {
  // somthing
});


```

## Typescript
to use some autocomplete when choosing the actors name you can do this
```typescript
declare module '@actorize/core/dist/types/actor/store' {
  // this interface is just being used with a "keyof" to be able to merge these
  // into the autocomplete system :) so the type is actually irrelevant. maybe we can use it later for specifing the payload?
  interface RecipientAsI {
    'ui.navigation-router': any;
    'ui.command-palette': any;
  }
}
```
