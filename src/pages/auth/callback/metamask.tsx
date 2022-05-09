import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { useAuthBy3rdPartSuccessed } from '../../../hooks/hooks'
import bindWeb3Mutation from '../../../schema/bindWeb3.graphql'
import { bindWeb3Address, bindWeb3AddressVariables } from '../../../schema/__generated__/bindWeb3Address'
import AuthCallbackPageContainer from './layout'

type AuthCallbackMetamaskProps = {
}

function AuthCallbackMetamask(props: AuthCallbackMetamaskProps) {
  const r = useRouter()
  const requestPayload = useMemo(() => {
    return {
      address: r.query.a as string,
      signature: r.query.s as string,
      text: decodeURIComponent(r.query.t as string)
    }
  }, [r.query])

  const [doBind, doBindResult] = useMutation<bindWeb3Address, bindWeb3AddressVariables>(bindWeb3Mutation)

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
