# @actorize/react

[![gzip size](https://badgen.net/bundlephobia/minzip/@actorize/react)]()

> this is just the React Extension for [@actorize/core](https://www.npmjs.com/package/@actorize/core)

## Getting Started

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
