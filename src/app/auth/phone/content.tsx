'use client'
import { useMutation } from '@apollo/client/react'
import React from 'react'
import { AuthByPhoneDocument, type AuthByPhoneMutation } from '@/gql/graphql'
import BindPhone from '../../../components/bind-phone'
import { useAuthByPhoneSuccessed } from '../../../hooks/hooks'

function AuthPhoneContent() {
  const [doAuth, doAuthResponse] =
    useMutation<AuthByPhoneMutation>(AuthByPhoneDocument)

  useAuthByPhoneSuccessed(
    doAuthResponse.called,
    doAuthResponse.loading,
    doAuthResponse.error,
    doAuthResponse.data?.authByPhone
  )

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

export default AuthPhoneContent
