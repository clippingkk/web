'use client'
import Button from '@/components/button'
import { CF_TURNSTILE_SITE_KEY } from '@/constants/config'
import { useTranslation } from '@/i18n/client'
import InputField from '@annatarhe/lake-ui/form-input-field'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { useEffect } from 'react'
import OTPInput from 'react-auth-code-input'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { AuthEvents, AuthMachine } from './auth.state'

type EmailLoginEntryProps = {
  machine: AuthMachine
  sendEvent: (event: AuthEvents) => void
}
const loginSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  otp: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

function EmailLoginEntry(props: EmailLoginEntryProps) {
  const { machine, sendEvent } = props
  const { t } = useTranslation()

  const [animationParent] = useAutoAnimate()

  const { control, watch, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      otp: '',
    },
  })

  // Watch form fields and send events
  const email = watch('email')
  const password = watch('password')
  const otp = watch('otp')

  useEffect(() => {
    if (email !== undefined) {
      sendEvent({ type: 'EMAIL_TYPING', email })
    }
  }, [email])

  useEffect(() => {
    if (password !== undefined) {
      sendEvent({ type: 'PWD_TYPING', pwd: password })
    }
  }, [password])

  useEffect(() => {
    if (otp !== undefined) {
      sendEvent({ type: 'OTP_TYPING', otp })
    }
  }, [otp])

  const machineCtxErrors = machine.context.errorMessages

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onTurnstileError = (err: any) => {
    if (process.env.NODE_ENV !== 'production') {
      sendEvent({ type: 'CF_VERIFIED', turnstileToken: 'temp' })
      return
    }
    toast.error('Turnstile: ' + err.toString())
  }

  const onSubmit = (_: LoginFormData) => {
    // Form submission is handled by manual login button
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full w-[300px]"
      ref={animationParent}
    >
      <div className="mb-4 w-full items-center justify-center">
        <h2 className="font-lato m-0 w-full bg-linear-to-br from-slate-600 to-sky-400 bg-clip-text pb-2 text-center text-4xl font-extrabold text-transparent dark:from-orange-300">
          ClippingKK
        </h2>
        <span className="font-lato mt-4 block w-full bg-linear-to-br from-green-800 to-indigo-400 bg-clip-text text-center text-base text-transparent dark:from-green-300">
          {t('app.slogan')}
        </span>
      </div>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <InputField
            label={t('app.auth.email')}
            placeholder={t('app.auth.email')}
            type="email"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
            {...field}
          />
        )}
      />
      {machine.matches({ Passcode: 'Password' }) && (
        <div className="mt-4">
          <div className="mb-1 flex w-full items-center justify-between">
            <span>{t('app.auth.pwd')}</span>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              onClick={() => sendEvent({ type: 'CHANGE_TO_OTP' })}
            >
              {t('app.auth.otpTitle')}
            </Button>
          </div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <InputField
                type="password"
                placeholder={t('app.auth.pwd')}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                {...field}
              />
            )}
          />
        </div>
      )}

      {machine.matches({ Passcode: 'OTP' }) && (
        <div className="my-4">
          <div className="mb-2 flex w-full items-center justify-between">
            <span>{t('app.auth.pwd')}</span>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              onClick={() => sendEvent({ type: 'CHANGE_TO_PASSWORD' })}
            >
              {machine.can({ type: 'CHANGE_TO_PASSWORD' }) &&
                t('app.auth.otpTitle')}
              {machine.can({ type: 'CHANGE_TO_OTP' }) && t('app.auth.pwd')}
            </Button>
          </div>
          <div className="flex items-center">
            <OTPInput
              onChange={(val: string) => {
                sendEvent({ type: 'OTP_TYPING', otp: val })
              }}
              allowedCharacters="numeric"
              inputClassName={
                'w-full h-16 border-0 text-center text-2xl bg-gray-100 bg-opacity-90 dark:bg-gray-800' +
                (machineCtxErrors
                  ? ' border-red-500 bg-red-300 dark:bg-red-900'
                  : '')
              }
              placeholder="-"
              containerClassName="grid grid-cols-6 gap-4 w-full"
            />
            <div className="ml-4">
              {machine.can({ type: 'RESEND' }) ? (
                <Button
                  isLoading={machine.matches({ Passcode: { OTP: 'sending' } })}
                  variant="secondary"
                  size="sm"
                  onClick={() => sendEvent({ type: 'RESEND' })}
                >
                  {t('app.auth.resend')}
                </Button>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('app.auth.resendIn', {
                    seconds: machine.context.resendOTPReminds,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="my-4 w-full">
        <Turnstile
          siteKey={CF_TURNSTILE_SITE_KEY}
          onSuccess={(t) =>
            sendEvent({ type: 'CF_VERIFIED', turnstileToken: t })
          }
          onError={onTurnstileError}
          className="mx-auto w-full"
        />
      </div>
      <Button
        fullWidth
        size="lg"
        className="mt-4 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700"
        variant="primary"
        disabled={!machine.can({ type: 'MANUAL_LOGIN' })}
        onClick={() => sendEvent({ type: 'MANUAL_LOGIN' })}
      >
        {t('app.auth.submit')}
      </Button>
    </form>
  )
}

export default EmailLoginEntry
