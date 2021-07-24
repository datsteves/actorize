// eslint-disable-next-line import/no-cycle
import createDefaultStorage, { RemoteStorageInterface } from './defaultStorage';
// eslint-disable-next-line import/no-cycle
import createRemoteStorageProvider from './remoteStorageProvider';
// eslint-disable-next-line import/no-cycle
import createRemoteStorageConsumer from './remoteStorageConsumer';

export {
  createDefaultStorage,
  createRemoteStorageProvider,
  RemoteStorageInterface,
  createRemoteStorageConsumer,
};
