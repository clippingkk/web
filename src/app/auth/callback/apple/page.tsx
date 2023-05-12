import React from 'react'
import AuthCallbackApple from './content'
import { generateMetadata as authGenerateMetadata } from '../../../../components/og/og-with-auth'
import { Metadata } from 'next'

type AppleCallbackPageProps = {
  params: {}
  searchParams: { i: string }
}

export function generateMetadata(): Metadata {
  return authGenerateMetadata('auth/callback/apple')
}

function AppleCallbackPage(props: AppleCallbackPageProps) {
  const idToken = props.searchParams.i
  return (
    <AuthCallbackApple idToken={idToken} />
  )
}

export default AppleCallbackPage
