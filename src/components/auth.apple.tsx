'use client'
import type { Unmasked } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import {
  AppleLoginPlatforms,
  type AuthLoginResponseFragment,
  LoginByAppleDocument,
  type LoginByAppleQuery,
} from '@/gql/graphql'
import { useAuthBy3rdPartSuccessed } from '../hooks/hooks'
import type { AppleAuthResponse } from '../services/apple'
import AppleLoginButtonView from './auth/apple'

type AuthAppleProps = {
  disabled?: boolean
}

function AuthByAppleButton(props: AuthAppleProps) {
  const router = useRouter()
  const [doAppleAuth, appleAuthResponse] =
    useLazyQuery<LoginByAppleQuery>(LoginByAppleDocument)

  const onSuccess = useCallback(
    async (resp: AppleAuthResponse) => {
      const { code, id_token, state } = resp.authorization
      const r = await doAppleAuth({
        variables: {
          payload: {
            code: code,
            idToken: id_token,
            state: state,
            platform: AppleLoginPlatforms.Web,
          },
        },
      })
      if (
        (r.data?.loginByApple as Unmasked<AuthLoginResponseFragment>)
          .noAccountFrom3rdPart
      ) {
        router.push(`/auth/callback/apple?i=${id_token}`)
        return
      }
    },
    [doAppleAuth, router]
  )

  // on success
  useAuthBy3rdPartSuccessed(
    appleAuthResponse.called,
    appleAuthResponse.loading,
    appleAuthResponse.error,
    appleAuthResponse.data?.loginByApple as
      | Unmasked<AuthLoginResponseFragment>
      | undefined
  )

  const loading = appleAuthResponse.loading

  return (
    <AppleLoginButtonView
      loading={loading}
      disabled={props.disabled}
      onSuccess={onSuccess}
      onError={
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => {
          toast.error(`Auth by Apple: ${error.error}`)
        }
      }
    />
  )
}

export default AuthByAppleButton
