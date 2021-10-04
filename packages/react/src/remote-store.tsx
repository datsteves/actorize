import React from "react";
import { createRemoteStorageConsumer } from "@actorize/core";
import { Context } from "./core";

export const useRemoteStorage = (storeLocation: string) => {
  const { director } = React.useContext(Context);
  const [store] = React.useState(
    createRemoteStorageConsumer(director, {
      storeLocation
    })
  );
  return store;
};

interface UseRemoteStorageFieldOptions {
  useOptimisticReponse?: boolean;
}

export function useRemoteStorageField<T = unknown>(
  storeLocation: string,
  fieldKey: string,
  options?: UseRemoteStorageFieldOptions
) {
  const { useOptimisticReponse = false } = options || {};

  const store = useRemoteStorage(storeLocation);
  const [value, setValue] = React.useState<T>();

  React.useEffect(() => {
    // subsribe to updates so we can update
    store.onUpdate([fieldKey], (_, val: T) => {
      setValue(val);
    });
    // get the inital state and then just set it
    store
      .get(fieldKey)
      .then((val: T) => setValue(val))
      .catch(() => {
        // TODO: if in debug mode do console log out this error
        // just ignore it for now
      });
  }, [store, setValue, fieldKey]);

  const remoteSetValue = React.useCallback(
    async (val: T) => {
      await store.set(fieldKey, val);
      if (useOptimisticReponse) {
        setValue(val);
      }
    },
    [setValue, useOptimisticReponse, store, fieldKey]
  );
  return [value, remoteSetValue];
}
