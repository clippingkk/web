'use client'
import { useMachine } from '@xstate/react'
import toast from 'react-hot-toast'
import { fromPromise } from 'xstate'
import { useLoginV3Successed } from '@/hooks/hooks'
import {
  OtpChannel,
  useAuthLazyQuery,
  useDoLoginV3Mutation,
  useSendOtpMutation,
} from '@/schema/generated'
import authMachine from './auth.state'
import EmailLoginEntry from './emailEntry'
import ThirdPartEntry from './thirdPartEntry'

function AuthV4Content() {
  const [doSendOtp] = useSendOtpMutation()
  const [doAuth, doAuthData] = useAuthLazyQuery()
  const [loginV3, loginV3Response] = useDoLoginV3Mutation()

  useLoginV3Successed(
    doAuthData.called,
    doAuthData.loading,
    doAuthData.error,
    doAuthData.data?.auth
  )

  useLoginV3Successed(
    loginV3Response.called,
    loginV3Response.loading,
    loginV3Response.error,
    loginV3Response.data?.loginV3
  )
  const [state, send] = useMachine(
    authMachine.provide({
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
              cfTurnstileToken: input.turnstileToken,
            },
          })
            .then((r) => {
              toast.success('OTP Sent, please check your email box', { id: t })
              return r
            })
            .catch((e) => {
              toast.error(e.message, { id: t })
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
                cfTurnstileToken: input.turnstileToken!,
              },
            })
              .then((r) => {
                if (!r.data) {
                  throw r.error
                }
                toast.success('Auth by Email: login success', { id: t })
                return r.data?.auth
              })
              .catch((e) => {
                toast.error(e.toString(), { id: t })
                throw e
              })
          }

          return loginV3({
            variables: {
              payload: {
                email: input.email,
                otp: input.otp!,
              },
            },
          })
            .then((r) => {
              toast.success('Auth by Email: login success', { id: t })
              return r.data?.loginV3
            })
            .catch((e) => {
              toast.error(e.toString(), { id: t })
              throw e
            })
        }),
        setLocalState: fromPromise(() => {
          return Promise.resolve()
        }),
      },
    }),
    {
      // inspect
    }
  )

  return (
    <div className='flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-4 gap-4 rounded-2xl shadow-lg'>
      <div className='px-8 py-6 flex flex-col rounded-xl bg-white dark:bg-zinc-900 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm shadow-xl'>
        <EmailLoginEntry machine={state} sendEvent={send} />
      </div>
      <ThirdPartEntry />
    </div>
  )
}

export default AuthV4Content
