import { Button, TextInput } from '@mantine/core'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import OTPInput from 'react-auth-code-input'
import { AuthMachine, AuthEvents } from './auth.state'
import { Form, useForm } from '@mantine/form'
import { useTranslation } from '@/i18n/client'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { Turnstile } from '@marsidev/react-turnstile'
import { CF_TURNSTILE_SITE_KEY } from '@/constants/config'
import toast from 'react-hot-toast'

type EmailLoginEntryProps = {
  machine: AuthMachine
  sendEvent: (event: AuthEvents) => void
}

function EmailLoginEntry(props: EmailLoginEntryProps) {
  const { machine, sendEvent } = props
  const { t } = useTranslation()

  const [animationParent] = useAutoAnimate()

  const f = useForm({
    initialValues: {
      email: '',
      password: '',
      otp: '',
    },
  })

  f.watch('email', (email) => {
    sendEvent({ type: 'EMAIL_TYPING', email: email.value })
  })
  f.watch('password', (password) => {
    sendEvent({ type: 'PWD_TYPING', pwd: password.value })
  })
  f.watch('otp', (otp) => {
    sendEvent({ type: 'OTP_TYPING', otp: otp.value })
  })

  const machineCtxErrors = machine.context.errorMessages

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onTurnstileError = (err: any) => {
    if (process.env.NODE_ENV !== 'production') {
      sendEvent({ type: 'CF_VERIFIED', turnstileToken: 'temp' })
      return
    }
    toast.error('Turnstile: ' + err.toString())
  }

  return (
    <Form
      form={f}
      className="h-full"
      ref={animationParent}
      style={{ width: 300 }}
    >
      <div className="mb-4 w-full items-center justify-center">
        <h2 className="text-4xl m-0 font-extrabold bg-clip-text from-slate-600 dark:from-orange-300 to-sky-400 text-transparent bg-linear-to-br font-lato pb-2 w-full text-center">ClippingKK</h2>
        <span className="text-base mt-4 font-lato bg-clip-text from-green-800 dark:from-green-300 to-indigo-400 text-transparent bg-linear-to-br text-center w-full block ">{t('app.slogan')}</span>
      </div>
      <TextInput
        labelProps={{
          className: 'mb-1',
        }}
        size="lg"
        placeholder={t('app.auth.email')}
        // label={t('app.auth.email')}
        type="email"
        className="w-full"
        name="email"
        onBlur={() => sendEvent({ type: 'EMAIL_TYPING', email: f.values.email })}
        onKeyDown={async (e) => {
          if (e.key !== 'Enter') {
            return
          }
          await f.validate()
          sendEvent({ type: 'EMAIL_TYPING', email: f.values.email })
        }}
        {...f.getInputProps('email')}
      />
      {machine.matches({ Passcode: 'Password' }) && (
        <TextInput
          labelProps={{
            className: 'w-full mt-4',
          }}
          name="password"
          size="lg"
          label={(
            <div className="flex justify-between items-center w-full mb-1">
              <span>
                {t('app.auth.pwd')}
              </span>
              <div>
                <Button
                  size="xs"
                  variant='white'
                  rightSection={<ChevronRightIcon className="w-4 h-4" />}
                  onClick={() => sendEvent({ type: 'CHANGE_TO_OTP' })}>
                  {t('app.auth.otpTitle')}
                </Button>
              </div>
            </div>
          )}
          type="password"
          placeholder={t('app.auth.pwd')}
          onBlur={() => sendEvent({ type: 'PWD_TYPING', pwd: f.values.password })}
          onKeyDown={async (e) => {
            if (e.key !== 'Enter') {
              return
            }
            await f.validate()
            sendEvent({ type: 'PWD_TYPING', pwd: f.values.password })
          }}
          {...f.getInputProps('password')}
        />
      )}

      {machine.matches({ Passcode: 'OTP' }) && (
        <div className="my-4 ">
          <div className="flex justify-between items-center w-full mb-2">
            <span>{t('app.auth.pwd')}</span>
            <div>
              <Button
                size="xs"
                variant='white'
                rightSection={<ChevronRightIcon className="w-4 h-4" />}
                onClick={() => sendEvent({ type: 'CHANGE_TO_PASSWORD' })}>
                {machine.can({ type: 'CHANGE_TO_PASSWORD' }) && t('app.auth.otpTitle')}
                {machine.can({ type: 'CHANGE_TO_OTP' }) && t('app.auth.pwd')}
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <OTPInput
              onChange={(val: string) => {
                sendEvent({ type: 'OTP_TYPING', otp: val })
              }}
              allowedCharacters='numeric'
              inputClassName={
                'w-full h-16 border-0 text-center text-2xl bg-gray-100 bg-opacity-90' + (machineCtxErrors ? ' border-red-500 bg-red-300' : '')}
              placeholder="-"
              containerClassName='grid grid-cols-6 gap-4 w-full'
            />
            <div className="ml-4">
              {machine.can({ type: 'RESEND' }) && (
                <Button
                  loading={machine.matches({ Passcode: { OTP: 'sending' } })}
                  onClick={() => sendEvent({ type: 'RESEND' })}
                >
                  {t('app.auth.resend')}
                </Button>
              )}
              {!machine.can({ type: 'RESEND' }) && (
                <div>
                  seconds reminds {machine.context.resendOTPReminds}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Turnstile
        siteKey={CF_TURNSTILE_SITE_KEY}
        onSuccess={t => sendEvent({ type: 'CF_VERIFIED', turnstileToken: t })}
        onError={onTurnstileError}
        className='mx-auto my-4 w-full'
      />
      <Button
        fullWidth
        size="lg"
        className="mt-4"
        disabled={!machine.can({ type: 'MANUAL_LOGIN' })}
        onClick={() => sendEvent({ type: 'MANUAL_LOGIN' })}
      >
        {t('app.auth.submit')}
      </Button>
    </Form>
  )
}

export default EmailLoginEntry
