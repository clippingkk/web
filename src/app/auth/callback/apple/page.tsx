import React from 'react'
import AuthCallbackApple from './content'

type AppleCallbackPageProps = {
  params: {}
  searchParams: { i: string }
}

function AppleCallbackPage(props: AppleCallbackPageProps) {
  const idToken = props.searchParams.i
  return (
    <AuthCallbackApple idToken={idToken} />
  )
}

export default AppleCallbackPage
