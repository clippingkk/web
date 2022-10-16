import React, { useState } from 'react'
import Turnstile from "react-turnstile"
import { CF_TURNSTILE_SITE_KEY } from '../../constants/config'
import { REGEX_EMAIL } from '../../services/regex'

type EmailBoxProps = {
  loading: boolean
  onEmailSubmit(email: string, turnstileToken: string): void
}

function EmailBox(props: EmailBoxProps) {
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  return (
    <form
      onSubmit={() => {
        if (props.loading) {
          return
        }
        props.onEmailSubmit(email, turnstileToken)
      }}
      className='w-full'
    >
      <fieldset className='w-full mb-10'>
        <label
          htmlFor="email"
          className='text-gray-100 text-lg mb-2 capitalize'
        >
          email
        </label>
        <input
          type="email"
          placeholder='email@gmail.com'
          className=' w-full rounded px-2 py-4 bg-gray-100 bg-opacity-90'
          value={email}
          onChange={e => setEmail(e.target.value.trim())}
        />
      </fieldset>
      <fieldset>
        <Turnstile
          sitekey={CF_TURNSTILE_SITE_KEY}
          onVerify={t => setTurnstileToken(t)}
        />
      </fieldset>
      <div className='w-full mt-4'>
        <button
          className='text-white w-full rounded bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300'
          type='submit'
          disabled={props.loading || turnstileToken === '' || !REGEX_EMAIL.test(email)}
          title='send one time passcode'
        >
          Send OTP
        </button>
      </div>
    </form>
  )
}

export default EmailBox
