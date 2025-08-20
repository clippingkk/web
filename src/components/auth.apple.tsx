'use client'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthBy3rdPartSuccessed } from '../hooks/hooks'
import {
  AppleLoginPlatforms,
  useLoginByAppleLazyQuery,
} from '../schema/generated'
import type { AppleAuthResponse } from '../services/apple'
import AppleLoginButtonView from './auth/apple'

type AuthAppleProps = {
  disabled?: boolean
}

function AuthByAppleButton(props: AuthAppleProps) {
  const router = useRouter()
  const [doAppleAuth, appleAuthResponse] = useLoginByAppleLazyQuery()

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
      if (r.data?.loginByApple.noAccountFrom3rdPart) {
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
    appleAuthResponse.data?.loginByApple
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
          toast.error('Auth by Apple: ' + error.error)
        }
      }
    />
  )
}

export default AuthByAppleButton
