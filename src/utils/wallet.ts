import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import Web3 from 'web3'
import { URLS } from './chains'
// export const [network, hooks] = initializeConnector<Network>(
//   (actions) => new Network(actions, URLS),
//   Object.keys(URLS).map((chainId) => Number(chainId))
// )

const [metaMask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask(actions))


const LoginWelcomeText = 'Welcome to the ClippingKK~ \n It`s your nonce: '

async function signDataByWeb3(address: string) {
  const web3 = new Web3(metaMask.provider as any)

  const nonce = Date.now()

  const text = LoginWelcomeText + nonce

  const signature = await web3.eth.personal.sign(text, address, '')
  return {
    address,
    signature,
    text
  }
}

export {
  metaMask,
  hooks,
  signDataByWeb3
}
