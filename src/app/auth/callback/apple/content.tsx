'use client'
import React, { useCallback, useMemo } from 'react'
import { useAuthBy3rdPartSuccessed } from '@/hooks/hooks'
import { AppleLoginPlatforms, useBindAppleUniqueMutation } from '@/schema/generated'
import AuthCallbackPageContainer from '@/components/auth/fake-layout'

type AuthCallbackAppleProps = {
  idToken: string
}

function AuthCallbackApple(props: AuthCallbackAppleProps) {
  const { idToken } = props

  const requestPayload = useMemo(() => {
    return {
      code: '',
      idToken,
      state: '',
      platform: AppleLoginPlatforms.Web
    }
  }, [idToken])

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
