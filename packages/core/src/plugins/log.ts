import { Message } from '../actor';
import { ActorizePlugin } from '../actor/director';

interface CreateLogPluginOptions {
  logger?: (...msg: unknown[]) => void,
  filter?: (msg: Message) => boolean;
}

const createLogPlugin = (opts?: CreateLogPluginOptions): ActorizePlugin => {
  const {
    logger = console.debug,
    filter,
  } = opts || {};
  return {
    onMessage: (msg) => {
      if (filter) {
        const shouldLog = filter(msg);
        if (!shouldLog) {
          return msg;
        }
      }
      logger(`[ACTORIZE] (${msg.sender}) => (${msg.recipient})`, msg.payload);
      return msg;
    },
  };
};

export default createLogPlugin;
