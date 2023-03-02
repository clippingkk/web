import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { useAuthBy3rdPartSuccessed } from '../../../hooks/hooks'
import { AppleLoginPlatforms, useBindAppleUniqueMutation } from '../../../schema/generated'
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
      platform: AppleLoginPlatforms.Web
    }
  }, [r.query])

  const [doBind, doBindResult] = useBindAppleUniqueMutation()

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
