![Logo Blue](https://raw.githubusercontent.com/datsteves/actorize/main/images/Logo%20Blue.svg)

Is a package that helps you to split up components into multiple actors, that can talk to each other, without knowing where those actors are. can be useful for:

- send files to a web worker to upload them there and get events on how far it is
- long-running tasks and their state changes over time that needs to be reflected in the UI
- Clicking on a Button should open a General Modal that can be opened in multiple ways, like a command palette.

if you don't know why this can be nice to have then here is a [talk from Paul Lewis and Surma](https://www.youtube.com/watch?v=Vg60lf92EkM&ab_channel=GoogleChromeDevelopers) where they explain where the idea comes from and what benefits it brings. The whole idea of this package started with that talk and being frustrated in some projects that I just couldn't toggle a state somewhere in the app without doing a global state in redux or mobx. Especially if you are doing things via multiple threads like a button sends an event to a worker_thread that was started in the electron main thread, Redux/Mobx wouldn't be an option anyways.

## Getting Started

```bash
$ npm install @actorize/core
# or
$ yarn add @actorize/core
```

```javascript
import { createDirector, createStore } from '@actorize/core';

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
import { dispatch } from '@actorize/core';
import director from './director';
// ...

const MyCoolActor = () => {
  const [state, setState] = useSate(0);

  const actor = useActorize('cool-actor', {
    onMessage: (msg) => {
      if (msg.payload === 'INC') {
        setState(state + 1);
      }
    },
  });

  return <div>{state}</div>;
};

const ThatBigButton = () => {
  const handleClick = () => {
    dispatch(director, 'cool-actor', 'INC');
  };
  return <button onClick={handleClick}>Click Me</button>;
};

const Wrapper = () => (
  <ActorizeProvider director={director}>
    <MyCoolActor />
    <ThatBigButton />
  </ActorizeProvider>
);
```

## Working with Threads

```javascript
// ui.js
import { createDirector, createRouter, createStore, createNetworkInterface } from '@actorize/core';

const myWorker = new Worker('/worker.js');
const workerInterface = createNetworkInterface();

myWorker.onmessage = (arg) => {
  workerInterface.sendLocal(arg.data);
};
workerInterface.handleLocalIncomingMessages((msg) => {
  myWorker.postMessage(msg);
});

// or to make it easier you can use
// const workerInterface = createWorkerInterface(myWorker)

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

import { createDirector, createStore, createWorkerInterface, createRouter } from '@actorize/core';

// as self is in this instance a worker object/instance.
const ni = createWorkerInterface(self);

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

if you are using typescript, currently you have to set types like this

```typescript
declare module '@actorize/core/dist/types/actor/store' {
  interface RecipientAsI {
    'ui.navigation-router': { actionType: 'PUSH' | 'REPLACE'; path: string };
    'ui.command-palette': { action: 'OPEN' | 'CLOSE' };
  }
}
```

or when you just want to play around a little or do not care about type safety, then override it with

```typescript
declare module '@actorize/core/dist/types/actor/store' {
  interface RecipientAsI {
    [key: string]: any;
  }
}
```

then you do not have any autocomplete or checking, but it does not throw type errors either.

## Plugin System

the most basic plugin is the logging plugin. This can be helpful to see when what actor sends what.

```javascript
import { createDirector, createStore, createLogPlugin } from '@actorize/core';

// logs into 'debug' with "[ACTORIZE] ({{sender}}) => ({{recipient}}), {{payload}}"
const logPlugin = createLogPlugin();

// you have the option to filter too.
// this would only log messages from the actor named "ui"
// createLogPlugin({ filter: (msg) => msg.sender === 'ui'  })

const director = createDirector({
  store: createStore(),
  plugins: [logPlugin],
});
```

A plugin in general can be used to transform messages before they are saved to the store too. At the moment it just has options for `onMessage` which gets a `Message` and has to return a `Message`.
The Typescript interface for the Plugin is

```typescript
interface ActorizePlugin {
  onMessage?: (msg: Message) => Message;
}
```
