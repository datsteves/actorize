import React from "react";
import { Director, Message, Recipient } from "@actorize/core";

interface ActorizeProviderProps {
  director: Director;
  children: React.ReactElement[] | React.ReactElement;
}

export const Context = React.createContext<{ director: Director }>(
  {} as { director: Director }
);

export const ActorizeProvider = (props: ActorizeProviderProps) => {
  const { children, director } = props;
  return <Context.Provider value={{ director }}>{children}</Context.Provider>;
};

interface UseActorizeOptions {
  onMessage?: (msgs: Message) => void;
}

export const useActorize = (name: Recipient, options?: UseActorizeOptions) => {
  const { onMessage } = options || {};
  const { director } = React.useContext(Context);
  // @ts-expect-error that is never because the original is always never ... as we do not have a default value
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
