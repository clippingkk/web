import React, { useState } from 'react'
import OTPInput from 'react-auth-code-input'
import ButtonSimple from '../button/button-simple'


type OTPBoxProps = {
  loading: boolean
  onSubmit(val: string): void
}

// TODO: resend case
function OTPBox(props: OTPBoxProps) {
  // read from clipboard
  const [otp, setOtp] = useState('')

  const onSubmit = () => {
    if (otp.length !== 6) {
      return
    }
    props.onSubmit(otp)
  }

  console.log(otp)

  return (
    <div className='w-full with-fade-in'>
      <p
        className='text-white text-center mb-4'
      >
        OTP sent, please check your email
        <br />
        if not, please find in spam box
      </p>

      <OTPInput
        onChange={(val: string) => {
          console.log('vvvv', val)
          setOtp(val)
        }}
        allowedCharacters='numeric'
        inputClassName='w-12 h-24 mr-4 last:mr-0 text-center text-2xl'
        containerClassName='w-full'
      />

      <ButtonSimple
        onClick={onSubmit}
        disabled={props.loading || otp.length !== 6}
        text='Confirm'
      />
    </div>
  )
}

export default OTPBox
