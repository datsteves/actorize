// eslint-disable-next-line import/no-cycle
import { createNetworkInterface } from '../index';

export const createWorkerInterface = (worker: Worker) => {
  const ni = createNetworkInterface();
  // is there a better option?
  // eslint-disable-next-line no-param-reassign
  worker.onmessage = (e) => {
    ni.sendLocal(e.data);
  };
  ni.handleLocalIncomingMessages((msg) => {
    worker.postMessage(msg);
  });
  return ni;
};

export default {};
