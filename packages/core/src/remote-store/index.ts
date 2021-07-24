// eslint-disable-next-line import/no-cycle
import createDefaultStorage, { RemoteStorageInterface } from './defaultStorage'
import createRemoteStorageProvider from './remoteStorageProvider'
import createRemoteStorageConsumer from './remoteStorageConsumer'

export { createDefaultStorage, createRemoteStorageProvider, RemoteStorageInterface, createRemoteStorageConsumer }
