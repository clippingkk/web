'use client'
import React from 'react'
import Head from 'next/head'
import { useAuthByPhoneSuccessed } from '../../../hooks/hooks'
import BindPhone from '../../../components/bind-phone'
import AuthPage from '../signin/layout'
import OGWithAuth from '../../../components/og/og-with-auth'
import { useAuthByPhoneMutation } from '../../../schema/generated'

type AuthPhoneProps = {
}

function AuthPhone(props: AuthPhoneProps) {
  const [doAuth, doAuthResponse] = useAuthByPhoneMutation()

  useAuthByPhoneSuccessed(doAuthResponse.called, doAuthResponse.loading, doAuthResponse.error, doAuthResponse.data?.authByPhone)

  return (
    <React.Fragment>
      {/* <Head>
        <title>手机登陆</title>
        <OGWithAuth urlPath='auth/phone' />
      </Head> */}
      <BindPhone
        onFinalCheck={(pn, code) => doAuth({ variables: { phone: pn, code } })}
      />
    </React.Fragment>
  )
}


AuthPhone.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <AuthPage>
      {page}
    </AuthPage>
  )
}

export default AuthPhone
