'use client'
import React from 'react'
import { useAuthByPhoneSuccessed } from '../../../hooks/hooks'
import BindPhone from '../../../components/bind-phone'
import { useAuthByPhoneMutation } from '../../../schema/generated'

function AuthPhoneContent() {
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


export default AuthPhoneContent
