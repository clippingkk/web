import React from 'react'
import authByPhoneMutation from '../../schema/mutations/auth-phone.graphql'
import { useMutation } from '@apollo/client'
import { authByPhone, authByPhoneVariables } from '../../schema/mutations/__generated__/authByPhone'
import { useAuthByPhoneSuccessed } from './hooks'
import BindPhone from '../../components/bind-phone'

type AuthPhoneProps = {
}

function AuthPhone(props: AuthPhoneProps) {
  const [doAuth, doAuthResponse] = useMutation<authByPhone, authByPhoneVariables>(authByPhoneMutation)

  useAuthByPhoneSuccessed(doAuthResponse.called, doAuthResponse.loading, doAuthResponse.error, doAuthResponse.data?.authByPhone)

  return (
    <BindPhone
      onFinalCheck={(pn, code) => doAuth({ variables: { phone: pn, code } })}
    />
  )
}

export default AuthPhone
