import { MetaMaskSDK } from '@metamask/sdk';
import { URLS } from './chains'

const LoginWelcomeText = 'Welcome to the ClippingKK~ \n It`s your nonce: '

async function signDataByWeb3() {
  const m = new MetaMaskSDK()
  const eth = m.getProvider()
  if (!eth) {
    throw new Error('MetaMask is not connected')
  }

  const accounts = await eth.request<string[]>({ method: 'eth_requestAccounts', params: [] });

  if (!accounts) {
    throw new Error('accounts not found')
  }

  const address = accounts[0]
  const nonce = Date.now()
  const text = LoginWelcomeText + nonce
  const msg = text;
  const signature = await eth.request<string>({
    method: 'personal_sign',
    params: [msg, address],
  });

  return {
    address,
    signature,
    text
  }
}

export {
  signDataByWeb3
}
