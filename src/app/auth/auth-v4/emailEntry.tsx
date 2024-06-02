import { Button, Fieldset, Input, TextInput } from "@mantine/core"
import { useAutoAnimate } from '@formkit/auto-animate/react'
import OTPInput from 'react-auth-code-input'
import { AuthMachine, AuthEvents } from "./auth.state"
import { Form, useForm } from "@mantine/form"
import { useTranslation } from "react-i18next"
import { ChevronRightIcon } from "@heroicons/react/24/solid"
import OTPBox from "../../../components/auth/otp-box"

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

  console.log(f.values)

  const machineCtxErrors = machine.context.errorMessages

  return (
    <Form form={f} className="w-128 h-full" ref={animationParent}>
      <TextInput
        labelProps={{
          className: 'mb-1',
        }}
        size="lg"
        placeholder={t('app.auth.email')}
        label={t('app.auth.email')}
        type="email"
        className="w-full"
        name="email"
        onBlur={() => sendEvent({ type: 'EMAIL_CONFIRMED', email: f.values.email })}
        onKeyDown={async (e) => {
          if (e.key !== 'Enter') {
            return
          }
          await f.validate()
          sendEvent({ type: 'EMAIL_CONFIRMED', email: f.values.email })
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
          <div className="flex justify-between items-center w-full mb-1">
            <span>{t('app.auth.otpTitle')}</span>
            <div>
              <Button
                size="xs"
                variant='white'
                rightSection={<ChevronRightIcon className="w-4 h-4" />}
                onClick={() => sendEvent({ type: 'CHANGE_TO_PASSWORD' })}>
                {t('app.auth.otpTitle')}
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
