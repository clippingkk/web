import React from 'react'
import AuthCallbackMetamask from './content'
import { Metadata } from 'next'
import { generateMetadata as authGenerateMetadata } from '../../../../components/og/og-with-auth'

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/callback/metamask')
}

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
