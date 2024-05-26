import { useMachine } from '@xstate/react'
import React, { useCallback } from 'react'
import authMachine from './auth.state'
import { fromPromise } from 'xstate'
import { OtpChannel, useSendOtpMutation } from '../../../schema/generated'
import toast from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../services/misc'

type AuthV4ContentProps = {
}

function AuthV4Content(props: AuthV4ContentProps) {
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
        return Promise.resolve({})
      })
    }
  }))

  return (
    <div>AuthV4Content</div>
  )
}

export default AuthV4Content
