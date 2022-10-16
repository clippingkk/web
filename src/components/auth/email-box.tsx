import React, { useState } from 'react'
import Turnstile from "react-turnstile"
import { CF_TURNSTILE_SITE_KEY } from '../../constants/config'

type EmailBoxProps = {
  loading: boolean
  onEmailSubmit(email: string, turnstileToken: string): void
}

function EmailBox(props: EmailBoxProps) {
  // email box
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
    >
      <fieldset>
        <label htmlFor="email">email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value.trim())} />
      </fieldset>
      <fieldset>
        <Turnstile
          sitekey={CF_TURNSTILE_SITE_KEY}
          onVerify={t => setTurnstileToken(t)}
        />
      </fieldset>
      <div>
        <button
          type='submit'
          disabled={props.loading}
        >next</button>
      </div>
    </form>
  )
}

export default EmailBox
