import { NetworkInterface, createNetworkInterface } from '..'

export const createLocalInterface = (ifc: NetworkInterface) => {
  const ni = createNetworkInterface()
  ifc.handleLocalIncomingMessages((msg) => {
    ni.sendLocal(msg)
  })
  ni.handleLocalIncomingMessages((msg) => {
    ifc.sendLocal(msg)
  })
  return ni
}

export default {}
