'use client'
import React, { useCallback, useMemo, useState } from 'react'
import { useAuthBy3rdPartSuccessed } from '../../../../hooks/hooks'
import { useBindWeb3AddressMutation } from '../../../../schema/generated'
import AuthCallbackPageContainer from '../fake-layout'

type AuthCallbackMetamaskProps = {
  address: string
  signature: string
  text: string
}

function AuthCallbackMetamask(props: AuthCallbackMetamaskProps) {
  const { address, signature, text } = props
  const requestPayload = useMemo(() => {
    return {
      address,
      signature,
      text: decodeURIComponent(text)
    }
  }, [address, signature, text])

  const [doBind, doBindResult] = useBindWeb3AddressMutation()

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
    doBindResult.data?.bindWeb3Address
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

export default AuthCallbackMetamask
