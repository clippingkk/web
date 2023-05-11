import React from 'react'
import AuthCallbackMetamask from './content'

type AppleCallbackPageProps = {
  params: {}
  searchParams: { a: string, s: string, t: string }
}

function MetamaskPage(props: AppleCallbackPageProps) {
  const { a: address, s: signature, t: text } = props.searchParams
  return (
    <AuthCallbackMetamask
      address={address}
      signature={signature}
      text={text}
    />
  )
}

export default MetamaskPage
