import { MetaMaskSDK } from '@metamask/sdk';

const LoginWelcomeText = 'Welcome to the ClippingKK~ \n It`s your nonce: '

console.log(process.env.infuraKey)

async function signDataByWeb3() {
  const m = new MetaMaskSDK()
  await m.init()
  const eth = m.getProvider() || window.ethereum
  if (!eth) {
    throw new Error('MetaMask is not connected')
  }

  const accounts = await eth.request<string[]>({ method: 'eth_requestAccounts', params: [] });

  if (!accounts) {
    throw new Error('accounts not found')
  }

  const address = accounts[0]
  if (!address) {
    throw new Error('address not found')
  }
  const nonce = Date.now()
  const text = LoginWelcomeText + nonce
  const msg = text;
  const signature = await eth.request<string>({
    method: 'personal_sign',
    params: [msg, address],
  });
  if (!signature) {
    throw new Error('signature not found')
  }

  return {
    address,
    signature,
    text
  }
}

export {
  signDataByWeb3
}
