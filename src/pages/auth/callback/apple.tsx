import { useMutation } from '@apollo/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import BindPhone from '../../../components/bind-phone'
import LoadingIcon from '../../../components/icons/loading.svg'
import OGWithAuth from '../../../components/og/og-with-auth'
import { useAuthBy3rdPartSuccessed } from '../../../hooks/hooks'
import bindAppleUniqueMutation from '../../../schema/auth/apple.bind.graphql'
import { bindAppleUnique, bindAppleUniqueVariables } from '../../../schema/auth/__generated__/bindAppleUnique'
import AuthPage from '../auth'
import AuthCallbackPageContainer from './layout'

type AuthCallbackAppleProps = {
}

function AuthCallbackApple(props: AuthCallbackAppleProps) {
  const r = useRouter()

  const requestPayload = useMemo(() => {
    return {
      code: '',
      idToken: r.query.i as string,
      state: '',
      platform: 'web'
    }
  }, [r.query])

  const [doBind, doBindResult] = useMutation<bindAppleUnique, bindAppleUniqueVariables>(bindAppleUniqueMutation)

  const onAuthCallback = useCallback((pn: string, code: string) => {
    return doBind({
      variables: {
        phone: pn,
        code,
        payload: requestPayload
      }
    })
  }, [doBind, requestPayload])

  useAuthBy3rdPartSuccessed(
    doBindResult.called,
    doBindResult.loading,
    doBindResult.error,
    doBindResult.data?.bindAppleUnique
  )

  return (
    <AuthCallbackPageContainer
      onAuthCallback={onAuthCallback}
      doBind={() => {
        return doBind({
          variables: {
            payload: requestPayload
          }
        })
      }}
      loading={doBindResult.loading}
    />
  )
}

export default AuthCallbackApple
