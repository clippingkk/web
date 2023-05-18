import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import Web3 from 'web3'
import { URLS } from './chains'

const [metaMask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({
  actions,
  options: {
    mustBeMetaMask: true
  }
}))

const LoginWelcomeText = 'Welcome to the ClippingKK~ \n It`s your nonce: '

async function signDataByWeb3(address: string) {
  if (!metaMask.provider) {
    throw new Error('MetaMask is not connected')
  }
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
