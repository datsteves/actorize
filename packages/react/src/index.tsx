import React from 'react';
import { Director, Message, createRemoteStorageConsumer } from '@actorize/core';

interface ActorizeProviderProps {
  director: Director;
  children: React.ReactElement[] | React.ReactElement;
}

const Context = React.createContext<{ director: Director }>({} as { director: Director });

export const ActorizeProvider = (props: ActorizeProviderProps) => {
  const { children, director } = props;
  return (
    <Context.Provider value={{ director }}>
      { children }
    </Context.Provider>
  );
};

interface UseActorizeOptions {
  onMessage?: (msgs: Message) => void
}

export const useActorize = (name: string, options?: UseActorizeOptions) => {
  const { onMessage } = options || {};
  const { director } = React.useContext(Context);
  const [actor] = React.useState(director.registerActor(name));
  React.useEffect(() => {
    if (onMessage) {
      actor.onMessage((msgs: Message[]) => {
        if (!onMessage) {
          return;
        }
        for (let i = 0; i < msgs.length; i += 1) {
          onMessage(msgs[i]);
        }
      });
    }
  }, [actor, onMessage]);

  return actor;
};

export const useRemoteStorage = (storeLocation: string) => {
  const { director } = React.useContext(Context);
  const [store] = React.useState(createRemoteStorageConsumer(director, {
    storeLocation,
  }));
  return store;
};

interface UseRemoteStorageFieldOptions {
  useOptimisticReponse?: boolean;
}

export const useRemoteStorageField = (
  storeLocation: string,
  fieldKey: string,
  options?: UseRemoteStorageFieldOptions,
) => {
  const {
    useOptimisticReponse = false,
  } = options || {};

  const store = useRemoteStorage(storeLocation);
  const [value, setValue] = React.useState<unknown>(undefined);

  React.useEffect(() => {
    // subsribe to updates so we can update
    store.onUpdate([fieldKey], (key: string, val: unknown) => {
      setValue(val);
    });
    // get the inital state and then just set it
    store.get(fieldKey)
      .then((val: unknown) => setValue(val))
      .catch(() => {
        // TODO: if in debug mode do console log out this error
        // just ignore it for now
      });
  }, [store, setValue, fieldKey]);

  const remoteSetValue = React.useCallback(async (val: unknown) => {
    await store.set(fieldKey, val);
    if (useOptimisticReponse) {
      setValue(val);
    }
  }, [setValue, useOptimisticReponse, store, fieldKey]);
  return [value, remoteSetValue];
};
