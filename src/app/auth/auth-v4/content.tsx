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
// import { createBrowserInspector } from '@statelyai/inspect'
// const { inspect } = createBrowserInspector();

type AuthV4ContentProps = {
  publicData?: PublicDataQuery
}

function AuthV4Content(props: AuthV4ContentProps) {
  const { publicData } = props
  const router = useRouter()
  // const [doSendOtp, {
  //   loading: isSendingOtp
  // }] = useSendOtpMutation()

  const doSendOtp = (...args: any) => new Promise(resolve => setTimeout(resolve, 2000))

  // const onEmailSubmit = useCallback((email: string, turnstileToken: string) => {
  //   toast.promise(doSendOtp({
  //     variables: {
  //       channel: OtpChannel.Email,
  //       address: email,
  //       cfTurnstileToken: turnstileToken
  //     }
  //   }), toastPromiseDefaultOption)
  // }, [doSendOtp])

  const { t } = useTranslation()

  const [doAppleAuth, appleAuthResponse] = useLoginByAppleLazyQuery()
  const [doAuth, doAuthData] = useAuthLazyQuery()
  const [doWeb3Auth, doWeb3AuthData] = useAuthByWeb3LazyQuery()
  const [
    loginV3,
    loginV3Response
  ] = useDoLoginV3Mutation()

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
        // if (r.data?.loginByWeb3.noAccountFrom3rdPart) {
        //   router.push(`/auth/callback/metamask?a=${address}&s=${signature}&t=${encodeURIComponent(text)}`)
        // }
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
        // if (r.data?.loginByApple.noAccountFrom3rdPart) {
        //   router.push(`/auth/callback/apple?i=${id_token}`)
        // }
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
    }
  }), {
    //  inspect 
  })

  return (
    <div className='w-full h-full bg-slate-100 relative'>
      <AuthBackgroundView publicData={publicData} />
      <div
        className='absolute top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col justify-center items-center with-fade-in'
        style={{
          '--start-color': 'oklch(45.08% 0.133 252.21 / 7.28%)',
          '--end-color': 'oklch(45.08% 0.133 252.21 / 77.28%)',
          backgroundImage: 'radial-gradient(var(--start-color) 0%, var(--end-color) 100%)',
        } as React.CSSProperties}
      >
        <div className='w-full h-full bg-slate-200 bg-opacity-5 backdrop-blur-sm flex justify-center items-center'>
          <div className='px-8 py-4 flex flex-col lg:flex-row rounded bg-slate-200 bg-opacity-80 backdrop-blur'>
            <EmailLoginEntry machine={state} sendEvent={send} />
            <Divider variant='vertical' className='mx-8' />
            <div className='mt-6 lg:mt-0'>
              <h3 className='text-lg mb-8 font-bold'>{t('app.auth.thirdPart.title')}</h3>
              <ThirdPartEntry machine={state} onEvent={send} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthV4Content
