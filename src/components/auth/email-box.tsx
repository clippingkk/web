import React, { useState } from 'react'
import Turnstile from "react-turnstile"

type EmailBoxProps = {
  onEmailSubmit(email: string, turnstileToken: string): void
}

function EmailBox(props: EmailBoxProps) {
  // email box
  const [turnstileVisible, setTurnstileVisible] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  return (
    <form>
      <fieldset>
        <label htmlFor="email">email</label>
        <input type="email" name="" />
      </fieldset>
      <fieldset>
        <Turnstile
          sitekey=''
          onVerify={t => setTurnstileToken(t)}
        />
      </fieldset>
      <div>
        <button type='submit'>next</button>
      </div>
    </form>
  )
}

export default EmailBox
