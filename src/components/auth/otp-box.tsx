import React, { useState } from 'react'

type OTPBoxProps = {
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

  return (
    <div>
      <p>tips: sent, please check your email. if not, please find in spam box</p>

      <input
        maxLength={6}
        value={otp}
        onChange={e => {
          const val = e.target.value.trim()
          // check if number is
          setOtp(val)
        }}
      />
      <button onClick={onSubmit}>
        submit
      </button>
    </div>
  )
}

export default OTPBox
