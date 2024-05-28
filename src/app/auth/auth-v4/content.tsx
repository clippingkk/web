import { useMachine } from '@xstate/react'
import React, { useCallback } from 'react'
import authMachine from './auth.state'
import { fromPromise } from 'xstate'
import { AppleLoginPlatforms, OtpChannel, useAuthByWeb3LazyQuery, useLoginByAppleLazyQuery, useSendOtpMutation } from '../../../schema/generated'
import toast from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../services/misc'
import { useActionTrack } from '../../../hooks/tracke'
import { GithubClientID } from '../../../constants/config'
import { useRouter } from 'next/navigation'

type AuthV4ContentProps = {
}

function AuthV4Content(props: AuthV4ContentProps) {
  const router = useRouter()
  const [doSendOtp, {
    loading: isSendingOtp
  }] = useSendOtpMutation()

  const onEmailSubmit = useCallback((email: string, turnstileToken: string) => {
    toast.promise(doSendOtp({
      variables: {
        channel: OtpChannel.Email,
        address: email,
        cfTurnstileToken: turnstileToken
      }
    }), toastPromiseDefaultOption)
  }, [doSendOtp])

  const [doAppleAuth, appleAuthResponse] = useLoginByAppleLazyQuery()
  const [doWeb3Auth, doWeb3AuthData] = useAuthByWeb3LazyQuery()

  const onGithubClick = useActionTrack('login:github')
  const [state, send] = useMachine(authMachine.provide({
    actors: {
      doSendOTP: fromPromise(async ({ input }) => {
        if (!input.email || !input.turnstileToken) {
          return
        }
        return toast.promise(doSendOtp({
          variables: {
            channel: OtpChannel.Email,
            address: input.email,
            cfTurnstileToken: input.turnstileToken
          }
        }), toastPromiseDefaultOption)
      }),
      doGithubLogin: fromPromise(async (ctx) => {
        onGithubClick()
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GithubClientID}&scope=user:email`
        location.href = githubAuthUrl

        // TODO: github login callback
      }),
      doMetamaskLogin: fromPromise(async ({ input }) => {
        if (!input.data) {
          // TODO: toast error if not exist
          return
        }
        const { address, signature, text } = input.data
        const r = await doWeb3Auth({
          variables: {
            payload: {
              address: address,
              signature: signature,
              text: text
            }
          }
        })
        if (r.data?.loginByWeb3.noAccountFrom3rdPart) {
          router.push(`/auth/callback/metamask?a=${address}&s=${signature}&t=${encodeURIComponent(text)}`)
        }
      }),
      doAppleLogin: fromPromise(async ({ input }) => {
        if (!input.data) {
          // TODO: toast error if not exist
          return
        }
        const { code, id_token, state } = input.data
        const r = await doAppleAuth({
          variables: {
            payload: {
              code: code,
              idToken: id_token,
              state: state,
              platform: AppleLoginPlatforms.Web,
            }
          }
        })
        if (r.data?.loginByApple.noAccountFrom3rdPart) {
          router.push(`/auth/callback/apple?i=${id_token}`)
        }
      }),
      doManualLogin: fromPromise(async (ctx) => {
      }),
    }
  }))

  return (
    <div>AuthV4Content</div>
  )
}

export default AuthV4Content
