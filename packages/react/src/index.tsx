import React from 'react'
import { Director, Message, createRemoteStorageConsumer } from '@actorize/core'

interface ActorizeProviderProps {
  director: Director;
  children: React.ReactElement[] | React.ReactElement;
}

const Context = React.createContext<{ director: Director }>({} as { director: Director })

export const ActorizeProvider = (props: ActorizeProviderProps) => {
  return (
    <Context.Provider value={{ director: props.director }}>
    { props.children }
    </Context.Provider>
  )
}

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
  const { director } = React.useContext(Context)
  const [store] = React.useState(createRemoteStorageConsumer(director, {
    storeLocation
  }))
  return store
}

interface UseRemoteStorageFieldOptions {
  useOptimisticReponse?: boolean;
}

export const useRemoteStorageField = (storeLocation: string, fieldKey: string, options?: UseRemoteStorageFieldOptions) => {
  const { useOptimisticReponse } = options || {}
  const store = useRemoteStorage(storeLocation)
  const [value, setValue] = React.useState(undefined)
  React.useEffect(() => {
    store.onUpdate([fieldKey], (key: string, val: any) => {
      setValue(val)
    })
    store.get(fieldKey).then((val: any) => setValue(val))
  }, [store, setValue])
  const remoteSetValue = React.useCallback(async (val: any) => {
    await store.set(fieldKey, val);
    if (useOptimisticReponse) {
      setValue(val)
    }

  }, [setValue, useOptimisticReponse, store])
  return [value, remoteSetValue]
}
