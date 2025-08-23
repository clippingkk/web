'use client'
import { useMutation } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'
import AuthCallbackPageContainer from '@/components/auth/fake-layout'
import {
  BindWeb3AddressDocument,
  type BindWeb3AddressMutation,
} from '@/gql/graphql'
import { useAuthBy3rdPartSuccessed } from '@/hooks/hooks'

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
      text: decodeURIComponent(text),
    }
  }, [address, signature, text])

  const [doBind, doBindResult] = useMutation<BindWeb3AddressMutation>(
    BindWeb3AddressDocument
  )

  const onAuthCallback = useCallback(
    (pn: string, code: string) => {
      return doBind({
        variables: {
          phone: pn,
          code,
          payload: requestPayload,
        },
      })
    },
    [doBind, requestPayload]
  )

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
            payload: requestPayload,
          },
        })
      }}
      loading={doBindResult.loading}
    />
  )
}

export default AuthCallbackMetamask
