import { Message } from '../actor';
import { ActorizePlugin } from '../actor/director'

interface createLogPluginOptions {
  logger?: (...msg: any) => void,
  filter?: (msg: Message) => boolean;
}

const createLogPlugin = (opts?: createLogPluginOptions): ActorizePlugin => {
  const {
    logger = console.debug,
    filter,
  } = opts || {};
  return {
    onMessage: (msg) => {
      if (filter) {
        const shouldLog = filter(msg)
        if (!shouldLog) {
          return msg
        }
      }
      logger(`[ACTORIZE] (${msg.sender}) => (${msg.recipient})`, msg.payload)
      return msg
    }
  }
}

export default createLogPlugin
