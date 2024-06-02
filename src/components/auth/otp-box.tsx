import React, { useCallback, useEffect, useState } from 'react'
import OTPInput from 'react-auth-code-input'
import ButtonSimple from '../button/button-simple'
import { useTranslation } from 'react-i18next'
import { ApolloError, FetchResult } from '@apollo/client'
import { DoLoginV3Mutation } from '../../schema/generated'


type OTPBoxProps = {
  autoValidate?: boolean
  loading: boolean
  onSubmit(val: string): Promise<any>
}

// TODO: resend case
function OTPBox(props: OTPBoxProps) {
  const { loading } = props
  // read from clipboard
  const [otp, setOtp] = useState('')
  const [hasErrorMsg, setHasErrorMsg] = useState<string | null>(null)

  const onSubmit = useCallback(async () => {
    if (otp.length !== 6) {
      return
    }
    try {
      await props.onSubmit(otp)
    } catch (e: any) {
      setHasErrorMsg(e.message)
    }
  }, [otp, props])

  // reset error status
  useEffect(() => {
    setHasErrorMsg(null)
  }, [otp])

  const { t } = useTranslation()

  return (
    <div className='w-full with-fade-in'>
      <p
        className=' text-slate-900 dark:text-white whitespace-break-spaces text-center mb-4'
      >
        {t('app.auth.info.otpSent')}
      </p>

      <OTPInput
        onChange={(val: string) => {
          setOtp(val)
        }}
        allowedCharacters='numeric'
        inputClassName={
          'w-full h-24 text-center text-2xl bg-gray-100 bg-opacity-90' + (hasErrorMsg ? ' border-red-500 bg-red-300' : '')}
        containerClassName='grid grid-cols-6 gap-4 w-full'
      />

      <ButtonSimple
        loading={loading}
        onClick={onSubmit}
        disabled={loading || otp.length !== 6}
        text='Confirm'
      />
    </div>
  )
}

export default OTPBox
