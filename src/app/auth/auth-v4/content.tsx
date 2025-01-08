'use client'
import { useMachine } from '@xstate/react'
import React from 'react'
import authMachine from './auth.state'
import { fromPromise } from 'xstate'
import { AppleAuthVersion, AppleLoginPlatforms, OtpChannel, useAuthByWeb3LazyQuery, useAuthLazyQuery, useDoLoginV3Mutation, useLoginByAppleLazyQuery, useSendOtpMutation } from '@/schema/generated'
import toast from 'react-hot-toast'
import { useActionTrack } from '@/hooks/tracke'
import { GithubClientID } from '@/constants/config'
import { useRouter } from 'next/navigation'
import ThirdPartEntry from './thirdPartEntry'
import { signDataByWeb3 } from '@/utils/wallet'
import { useTranslation } from 'react-i18next'
import { Divider } from '@mantine/core'
import EmailLoginEntry from './emailEntry'
import { useAuthBy3rdPartSuccessed, useLoginV3Successed } from '@/hooks/hooks'
// import { createBrowserInspector } from '@statelyai/inspect'
// const { inspect } = createBrowserInspector();

function AuthV4Content() {
  const router = useRouter()
  const { t } = useTranslation()
  const [doSendOtp] = useSendOtpMutation()
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

        const t = toast.loading('Sending OTP...')
        return doSendOtp({
          variables: {
            channel: OtpChannel.Email,
            address: input.email,
            cfTurnstileToken: input.turnstileToken
          }
        }).then(r => {
          toast.success('OTP Sent, please check your email box', { id: t })
          return r
        }).catch(e => {
          toast.error(e.message, { id: t })
          throw e
        })
      }),
      doGithubLogin: fromPromise(async () => {
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
        const t = toast.loading('Auth by Metamask: login in progress...')
        return doWeb3Auth({
          variables: {
            payload: {
              address: address,
              signature: signature,
              text: text
            }
          }
        })
          .then(r => r.data?.loginByWeb3)
          .then(r => {
            toast.success('Auth by Metamask: login success', { id: t })
            if (r?.noAccountFrom3rdPart) {
              console.log('redirect', 'aaaaa', address, signature, text)
              router.push(`/auth/callback/metamask?a=${address}&s=${signature}&t=${encodeURIComponent(text)}`)
              return
            }
            return r
          }).catch(e => {
            toast.error(e.toString(), { id: t })
            throw e
          })
      }),
      doAppleLogin: fromPromise(async ({ input }) => {
        if (!input.data) {
          toast.error('Auth by Apple: not exist')
          return
        }
        const { code, id_token, state } = input.data

        const t = toast.loading('Auth by Apple: login in progress...')
        return doAppleAuth({
          variables: {
            payload: {
              code: code,
              idToken: id_token,
              state: state,
              version: AppleAuthVersion.V4,
              platform: AppleLoginPlatforms.Web,
            }
          }
        })
          .then(r => r.data?.loginByApple)
          .then(r => {
            toast.success('Auth by Apple: login success', { id: t })
            if (r?.noAccountFrom3rdPart) {
              router.push(`/auth/callback/apple?i=${id_token}`)
            }
            return r
          }).catch(e => {
            toast.error(e.toString(), { id: t })
            throw e
          })
      }),
      connectWeb3Wallet: fromPromise(() => {
        const t = toast.loading('Connecting...')
        return signDataByWeb3().then(r => {
          toast.success('Connected', { id: t })
          return r
        }).catch(e => {
          toast.error(e.toString(), { id: t })
          throw e
        })
      }),
      doManualLogin: fromPromise(async ({ input }) => {
        if (!input.email) {
          return
        }
        const t = toast.loading('Auth by Email: login in progress...')
        if (!input.otp) {
          // 这里是用户名密码登录
          return doAuth({
            variables: {
              email: input.email,
              password: input.password!,
              cfTurnstileToken: input.turnstileToken!
            }
          }).then(r => {
            if (!r.data) {
              throw r.error
            }
            toast.success('Auth by Email: login success', { id: t })
            return r.data?.auth
          }).catch(e => {
            toast.error(e.toString(), { id: t })
            throw e
          })
        }

        return loginV3({
          variables: {
            payload: {
              email: input.email,
              otp: input.otp!
            }
          }
        })
          .then(r => {
            toast.success('Auth by Email: login success', { id: t })
            return r.data?.loginV3
          }).catch(e => {
            toast.error(e.toString(), { id: t })
            throw e
          })
      }),
      setLocalState: fromPromise(({ }) => {
        return Promise.resolve()
      })
    }
  }), {
    // inspect
  })

  return (
    <div className='px-8 py-4 flex flex-col lg:flex-row rounded bg-slate-200 dark:bg-slate-900 bg-opacity-70 dark:bg-opacity-90 backdrop-blur shadow-lg'>
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
