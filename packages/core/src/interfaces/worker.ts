import { createNetworkInterface } from '../index'

export const createWorkerInterface = (worker: Worker) => {
  const ni = createNetworkInterface()
  worker.onmessage = (e) => {
    ni.sendLocal(e.data)
  }
  ni.handleLocalIncomingMessages((msg) => {
    worker.postMessage(msg)
  })
  return ni
}

export default {}
