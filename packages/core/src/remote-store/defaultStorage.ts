// eslint-disable-next-line import/no-cycle
import { Director, dispatch, Message } from '../index';
import { randomstring } from '../utils';

export interface RemoteStorageInterface {
  set: (key: string, value: unknown) => Promise<void>;
  get: (key: string) => Promise<unknown>;
  delete: (key: string) => Promise<void>;
}

const createDefaultStorage = (defaultValue: Record<string, unknown> = {}): RemoteStorageInterface => {
  const data: Record<string, unknown> = defaultValue;
  return {
    set: async (key: string, value: unknown) => {
      data[key] = value;
    },
    get: async (key: string) => data[key],
    delete: async (key: string) => {
      delete data[key];
    },
  };
};

export default createDefaultStorage
