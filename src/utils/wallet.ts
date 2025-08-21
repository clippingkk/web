import type { MetaMaskSDK } from '@metamask/sdk-react'

const LoginWelcomeText = 'Welcome to the ClippingKK~ \n It`s your nonce: '

console.log(process.env.infuraKey)

async function signDataByWeb3(m: MetaMaskSDK) {
  const accounts = await m.connect()
  if (!accounts) {
    throw new Error('accounts not found')
  }

  const address = accounts[0]
  if (!address) {
    throw new Error('address not found')
  }
  const nonce = Date.now()
  const text = LoginWelcomeText + nonce
  const msg = text
  const signature = await m.connectAndSign({ msg })
  if (!signature) {
    throw new Error('signature not found')
  }

  return {
    address,
    signature,
    text,
  }
}

export { signDataByWeb3 }
