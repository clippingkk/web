'use client'
import { useMachine } from '@xstate/react'
import React, { useCallback } from 'react'
import authMachine from './auth.state'
import { fromPromise } from 'xstate'
import { AppleLoginPlatforms, OtpChannel, PublicDataQuery, useAuthByWeb3LazyQuery, useAuthLazyQuery, useAuthQuery, useDoLoginV3Mutation, useLoginByAppleLazyQuery, useSendOtpMutation } from '../../../schema/generated'
import toast from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../services/misc'
import { useActionTrack } from '../../../hooks/tracke'
import { GithubClientID } from '../../../constants/config'
import { useRouter } from 'next/navigation'
import ThirdPartEntry from './thirdPartEntry'
import AuthBackgroundView from './authBackground'
import { signDataByWeb3 } from '../../../utils/wallet'
import { useTranslation } from 'react-i18next'
import { Divider } from '@mantine/core'
import EmailLoginEntry from './emailEntry'
import { useAuthBy3rdPartSuccessed, useLoginV3Successed } from '../../../hooks/hooks'
// import { createBrowserInspector } from '@statelyai/inspect'
// const { inspect } = createBrowserInspector();

type AuthV4ContentProps = {
}

function AuthV4Content(props: AuthV4ContentProps) {
  const router = useRouter()

  const doSendOtp = (...args: any) => new Promise(resolve => setTimeout(resolve, 2000))

  const { t } = useTranslation()

  const [doAppleAuth, appleAuthResponse] = useLoginByAppleLazyQuery()
  useAuthBy3rdPartSuccessed(
    appleAuthResponse.called,
    appleAuthResponse.loading,
    appleAuthResponse.error,
    appleAuthResponse.data?.loginByApple
  )

  const [doAuth, doAuthData] = useAuthLazyQuery()
  useLoginV3Successed(doAuthData.called, doAuthData.loading, doAuthData.error, doAuthData.data?.auth)

  const [doWeb3Auth, doWeb3AuthData] = useAuthByWeb3LazyQuery()
  useAuthBy3rdPartSuccessed(doWeb3AuthData.called, doWeb3AuthData.loading, doWeb3AuthData.error, doWeb3AuthData.data?.loginByWeb3)
  const [
    loginV3,
    loginV3Response
  ] = useDoLoginV3Mutation()

  useLoginV3Successed(loginV3Response.called, loginV3Response.loading, loginV3Response.error, loginV3Response.data?.loginV3)

  const onGithubClick = useActionTrack('login:github')
  const [state, send] = useMachine(authMachine.provide({
    actors: {
      doSendOTP: fromPromise(async ({ input }) => {
        if (!input.email || !input.turnstileToken) {
          throw new Error('Auth by Email: not exist')
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
          toast.error('Auth by Metamask: not exist')
          throw new Error('Auth by Metamask: not exist')
        }
        const { address, signature, text } = input.data
        return toast.promise(doWeb3Auth({
          variables: {
            payload: {
              address: address,
              signature: signature,
              text: text
            }
          }
        }), toastPromiseDefaultOption)
          .then(r => r.data?.loginByWeb3)
          .then(r => {
            if (r?.noAccountFrom3rdPart) {
              router.push(`/auth/callback/metamask?a=${address}&s=${signature}&t=${encodeURIComponent(text)}`)
            }
            return r
          })
      }),
      doAppleLogin: fromPromise(async ({ input }) => {
        if (!input.data) {
          toast.error('Auth by Apple: not exist')
          return
        }
        const { code, id_token, state } = input.data
        return toast.promise(doAppleAuth({
          variables: {
            payload: {
              code: code,
              idToken: id_token,
              state: state,
              platform: AppleLoginPlatforms.Web,
            }
          }
        }), toastPromiseDefaultOption)
          .then(r => r.data?.loginByApple)
          .then(r => {
            if (r?.noAccountFrom3rdPart) {
              router.push(`/auth/callback/apple?i=${id_token}`)
            }
            return r
          })
      }),
      connectWeb3Wallet: fromPromise((ctx) => {
        return toast.promise(signDataByWeb3(), {
          loading: 'Connecting...',
          success: 'Signed',
          error: (err) => {
            return err.message ?? err.toString()
          },
        })
      }),
      doManualLogin: fromPromise(async ({ input }) => {
        if (!input.email) {
          return
        }
        if (!input.otp) {
          // 这里是用户名密码登录
          return toast.promise(doAuth({
            variables: {
              email: input.email,
              password: input.password!,
              cfTurnstileToken: input.turnstileToken!
            }
          }), toastPromiseDefaultOption)
            .then(r => r.data?.auth)
        }
        return toast.promise(loginV3({
          variables: {
            payload: {
              email: input.email,
              otp: input.otp!
            }
          }
        }), toastPromiseDefaultOption)
          .then(r => r.data?.loginV3)
      }),
      setLocalState: fromPromise(({ input }) => {
        return Promise.resolve()
      })
    }
  }), {
    //  inspect 
  })

  return (
    <div className='px-8 py-4 flex flex-col lg:flex-row rounded bg-slate-200 bg-opacity-80 backdrop-blur'>
      <EmailLoginEntry machine={state} sendEvent={send} />
      <Divider variant='vertical' className='mx-8' />
      <div className='mt-6 lg:mt-0'>
        <h3 className='text-lg mb-8 font-bold'>{t('app.auth.thirdPart.title')}</h3>
        <ThirdPartEntry machine={state} onEvent={send} />
      </div>
    </div>
  )
}

export default AuthV4Content
