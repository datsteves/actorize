import { PossibleMessagePayload, Message, Recipient } from './store'
import { Director } from './director'
import { randomstring } from '../utils'

export async function dispatch(director: Director, recipient: Recipient, payload: PossibleMessagePayload, waitTillResponse = false) {
  const randomActorName = randomstring()
  const actor = director.registerActor(randomActorName)
  let returnValue: undefined | Promise<Message>
  if (waitTillResponse) {
    returnValue = new Promise(resolve => {
      actor.onMessage((msgs) => {
        resolve(msgs[0])
      })
    })
  }

  await actor.sendMessage(recipient, payload)

  return returnValue
}
