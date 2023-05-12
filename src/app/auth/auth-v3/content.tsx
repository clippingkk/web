'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useBackgroundImage } from '../../../hooks/theme'
import logo from '../../../assets/logo.png'
import EmailBox from '../../../components/auth/email-box'
import OTPBox from '../../../components/auth/otp-box'
import { useLoginV3Successed } from '../../../hooks/hooks'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../services/misc'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { OtpChannel, useDoLoginV3Mutation, useSendOtpMutation } from '../../../schema/generated'

type AuthV3Props = {
}

function AuthV3Content(props: AuthV3Props) {
  const bg = useBackgroundImage()
  const { t } = useTranslation()
  const { back } = useRouter()

  const [validEmail, setValidEmail] = useState('')
  const [phase, setPhase] = useState(0)

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
    }), toastPromiseDefaultOption).then((res) => {
      setValidEmail(email)
      setPhase(1)
    })
  }, [doSendOtp])

  const [
    loginV3,
    loginV3Response
  ] = useDoLoginV3Mutation()

  const onOTPConfirmed = useCallback((otp: string) => {
    toast.promise(
      loginV3({
        variables: {
          payload: {
            email: validEmail,
            otp: otp
          }
        }
      }), toastPromiseDefaultOption)
  }, [loginV3, validEmail])

  useLoginV3Successed(loginV3Response.called, loginV3Response.loading, loginV3Response.error, loginV3Response.data?.loginV3)

  return (
    <React.Fragment>
      {/* <Head>
        <title>Login by ...</title>
        <OGWithAuth urlPath='auth/auth-v3' />
      </Head> */}
      <section
        className='anna-page-container h-screen object-cover bg-center bg-cover'
        style={{
          backgroundImage: `url(${bg.src})`
        }}
      >
        <div
          className='flex w-full h-full backdrop-blur-xl bg-black bg-opacity-30 justify-center items-center'
        >
          <div className='p-12 rounded backdrop-blur-xl shadow bg-opacity-10 bg-blue-400 w-128 container'>
            <div className='flex justify-between items-center mb-4'>
              <button
                className='flex dark:text-white hover:bg-gray-100 hover:bg-opacity-20 px-8 py-2 rounded transition-colors duration-300'
                onClick={() => {
                  back()
                }}
              >
                <ArrowUturnLeftIcon className=' w-6 h-6' />
                <span className='ml-2 inline-block'>Back</span>
              </button>
              <Link
                href='/auth/signin'
                className='flex dark:text-white hover:bg-gray-100 hover:bg-opacity-20 px-8 py-2 rounded transition-colors duration-300'>
                <ArrowUturnRightIcon className='w-6 h-6' />
                <span className='ml-2 inline-block'>{t('app.auth.loginWithPassword')}</span>
              </Link>
            </div>
            <div className='flex justify-center items-center flex-col mb-4'>
              <Image
                src={logo}
                alt="clippingkk logo"
                // className='w-24 h-24 lg:w-48 lg:h-48 shadow rounded'
                width={96}
                height={96}
              />
              <h1 className='text-center font-bold text-3xl mt-4 font-lxgw bg-clip-text from-orange-300 to-indigo-400 text-transparent bg-gradient-to-br'>ClippingKK</h1>
            </div>

            {phase === 0 && (
              <EmailBox
                onEmailSubmit={onEmailSubmit}
                loading={isSendingOtp}
              />
            )}
            {phase === 1 && (
              <OTPBox
                autoValidate
                onSubmit={onOTPConfirmed}
                loading={loginV3Response.loading}
              />
            )}
            <div className='w-full'>
              <hr className='my-8' />
              <p className='text-white mb-2'>
                {t('app.auth.legacyTip')}
              </p>
              <Link
                href='/auth/auth-v2'
                className='text-white block text-center w-full rounded bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300'>

                {t('app.auth.legacyLogin')}

              </Link>

              <hr className='my-4' />
              <p className='text-white'>
                {t('app.auth.accountTip')}
              </p>
            </div>
          </div>

        </div>
      </section>
    </React.Fragment>
  );
}

export default AuthV3Content
