'use client'
import { Undo2, Redo2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'

import logoDark from '@/assets/logo-dark.svg'
import logoLight from '@/assets/logo-light.svg'
import EmailBox from '@/components/auth/email-box'
import OTPBox from '@/components/auth/otp-box'
import { useLoginV3Successed } from '@/hooks/hooks'
import { useBackgroundImage } from '@/hooks/theme'
import { useTranslation } from '@/i18n/client'
import {
  OtpChannel,
  useDoLoginV3Mutation,
  useSendOtpMutation,
} from '@/schema/generated'
import { toastPromiseDefaultOption } from '@/services/misc'

function AuthV3Content() {
  const bg = useBackgroundImage()
  const { t } = useTranslation()
  const { back } = useRouter()

  const [validEmail, setValidEmail] = useState('')
  const [phase, setPhase] = useState(0)

  const [doSendOtp, { loading: isSendingOtp }] = useSendOtpMutation()

  const onEmailSubmit = useCallback(
    (email: string, turnstileToken: string) => {
      toast
        .promise(
          doSendOtp({
            variables: {
              channel: OtpChannel.Email,
              address: email,
              cfTurnstileToken: turnstileToken,
            },
          }),
          toastPromiseDefaultOption
        )
        .then(() => {
          setValidEmail(email)
          setPhase(1)
        })
    },
    [doSendOtp]
  )

  const [loginV3, loginV3Response] = useDoLoginV3Mutation()

  const onOTPConfirmed = useCallback(
    (otp: string) => {
      return toast.promise(
        loginV3({
          variables: {
            payload: {
              email: validEmail,
              otp: otp,
            },
          },
        }),
        toastPromiseDefaultOption
      )
    },
    [loginV3, validEmail]
  )

  useLoginV3Successed(
    loginV3Response.called,
    loginV3Response.loading,
    loginV3Response.error,
    loginV3Response.data?.loginV3
  )

  return (
    <section
      className="anna-page-container h-screen bg-cover bg-center object-cover"
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
    >
      <div className="bg-opacity-30 flex h-full w-full items-center justify-center bg-black backdrop-blur-xl">
        <div className="bg-opacity-10 container w-128 rounded-sm bg-blue-400 p-12 shadow-sm backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              className="hover:bg-opacity-20 flex rounded-sm px-8 py-2 transition-colors duration-300 hover:bg-gray-100 dark:text-white"
              onClick={() => {
                back()
              }}
            >
              <Undo2 className="h-6 w-6" />
              <span className="ml-2 inline-block">Back</span>
            </button>
            <Link
              href="/auth/signin"
              className="hover:bg-opacity-20 flex rounded-sm px-8 py-2 transition-colors duration-300 hover:bg-gray-100 dark:text-white"
            >
              <Redo2 className="h-6 w-6" />
              <span className="ml-2 inline-block">
                {t('app.auth.loginWithPassword')}
              </span>
            </Link>
          </div>
          <div className="mb-4 flex flex-col items-center justify-center">
            <Image
              src={logoLight}
              alt="clippingkk logo"
              className="dark:hidden"
              width={96}
              height={96}
            />
            <Image
              src={logoDark}
              alt="clippingkk logo"
              className="hidden dark:block"
              width={96}
              height={96}
            />
            <h1 className="font-lxgw mt-4 bg-linear-to-br from-orange-300 to-indigo-400 bg-clip-text text-center text-3xl font-bold text-transparent">
              ClippingKK
            </h1>
          </div>

          {phase === 0 && (
            <EmailBox onEmailSubmit={onEmailSubmit} loading={isSendingOtp} />
          )}
          {phase === 1 && (
            <OTPBox
              autoValidate
              onSubmit={onOTPConfirmed}
              loading={loginV3Response.loading}
            />
          )}
          <div className="w-full">
            <hr className="my-8" />
            <p className="mb-2 text-white">{t('app.auth.legacyTip')}</p>
            <Link
              href="/auth/auth-v2"
              className="block w-full rounded-sm bg-blue-400 py-4 text-center text-white transition-all duration-300 hover:bg-blue-500 disabled:bg-gray-300 disabled:hover:bg-gray-300"
            >
              {t('app.auth.legacyLogin')}
            </Link>

            <hr className="my-4" />
            <p className="text-white">{t('app.auth.accountTip')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthV3Content
