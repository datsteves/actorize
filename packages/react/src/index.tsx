import React from 'react'
import { Director, Message } from '@actorize/core'

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
  const { director } = React.useContext(Context)
  const [actor] = React.useState(director.registerActor(name))
  if (options) {
    if (options.onMessage) {
      actor.onMessage((msgs: Message[]) => {
        if (!options.onMessage) {
          return
        }
        for (let i = 0; i < msgs.length; i += 1) {
          options.onMessage(msgs[i])
        }
      })
    }
  }
  return actor
}
