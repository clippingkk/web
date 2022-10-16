import React, { useCallback, useState } from 'react'
import Image from 'next/image'
import { useBackgroundImage } from '../../hooks/theme'
import logo from '../../assets/logo.png'
import Head from 'next/head'
import OGWithAuth from '../../components/og/og-with-auth'
import EmailBox from '../../components/auth/email-box'
import { useMutation } from '@apollo/client'
import sendOtpMutation from '../../schema/auth/otp.graphql'
import loginV3Mutation from '../../schema/auth/loginv3.graphql'
import { sendOTP, sendOTPVariables } from '../../schema/auth/__generated__/sendOTP'
import { OTPChannel } from '../../../__generated__/globalTypes'
import OTPBox from '../../components/auth/otp-box'
import { doLoginV3, doLoginV3Variables } from '../../schema/auth/__generated__/doLoginV3'
import { useLoginV3Successed } from '../../hooks/hooks'

type AuthV2Props = {
}

function AuthV2(props: AuthV2Props) {
  const bg = useBackgroundImage()

  const [validEmail, setValidEmail] = useState('')
  const [phase, setPhase] = useState(1)

  const [doSendOtp, {
    loading: isSendingOtp
  }] = useMutation<sendOTP, sendOTPVariables>(sendOtpMutation)

  const onEmailSubmit = useCallback((email: string, turnstileToken: string) => {
    doSendOtp({
      variables: {
        channel: OTPChannel.Email,
        address: email,
        cfTurnstileToken: turnstileToken
      }
    }).then((res) => {
      setValidEmail(email)
      setPhase(1)
    })
  }, [doSendOtp])

  const [
    loginV3,
    loginV3Response
  ] = useMutation<doLoginV3, doLoginV3Variables>(loginV3Mutation)

  const onOTPConfirmed = useCallback((otp: string) => {
    loginV3({
      variables: {
        payload: {
          email: validEmail,
          otp: otp
        }
      }
    })
  }, [loginV3, validEmail])

  useLoginV3Successed(loginV3Response.called, loginV3Response.loading, loginV3Response.error, loginV3Response.data?.loginV3)

  return (
    <React.Fragment>
      <Head>
        <title>Login by ...</title>
        <OGWithAuth urlPath='auth/auth-v2' />
      </Head>
      <section
        className='anna-page-container h-screen object-cover bg-center bg-cover'
        style={{
          backgroundImage: `url(${bg})`
        }}
      >
        <div
          className='flex w-full h-full backdrop-blur-xl bg-black bg-opacity-30 justify-center items-center'
        >
          <div className='p-12 rounded backdrop-blur-xl shadow bg-opacity-10 bg-blue-400'>
            <div className='flex justify-center items-center flex-col mb-4'>
              <Image
                src={logo}
                alt="clippingkk logo"
                // className='w-24 h-24 lg:w-48 lg:h-48 shadow rounded'
                width={96}
                height={96}
              />
              <h1 className='text-center font-bold text-3xl dark:text-gray-100 mt-4'>ClippingKK</h1>
            </div>

            {phase === 0 && (
              <EmailBox
                onEmailSubmit={onEmailSubmit}
                loading={isSendingOtp}
              />
            )}
            {phase === 1 && (
              <OTPBox
                onSubmit={onOTPConfirmed}
                loading={loginV3Response.loading}
              />
            )}
          </div>
        </div>
      </section>
    </React.Fragment>
  )
}

export default AuthV2
