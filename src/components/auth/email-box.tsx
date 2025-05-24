import React, { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { CF_TURNSTILE_SITE_KEY } from '../../constants/config'
import { REGEX_EMAIL } from '../../services/regex'
import Button from '../button'
import { useTranslation } from 'react-i18next'

type EmailBoxProps = {
  loading: boolean
  onEmailSubmit(email: string, turnstileToken: string): void
}

function EmailBox(props: EmailBoxProps) {
  const { loading, onEmailSubmit } = props
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (loading) {
          return
        }
        onEmailSubmit(email, turnstileToken)
      }}
      className='w-full'
    >
      <fieldset className='w-full mb-10'>
        <label
          htmlFor="email"
          className='text-gray-100 text-lg mb-2 capitalize'
        >
          {t('app.auth.email')}
        </label>
        <input
          type="email"
          placeholder='email@gmail.com'
          className=' w-full rounded-sm px-2 py-4 bg-gray-100 bg-opacity-90'
          value={email}
          onChange={e => setEmail(e.target.value.trim())}
        />
      </fieldset>
      <fieldset>
        <Turnstile
          siteKey={CF_TURNSTILE_SITE_KEY}
          onSuccess={t => setTurnstileToken(t)}
          className='mx-auto'
        />
      </fieldset>
      <div className='w-full mt-4'>
        <Button
          className='bg-gradient-to-br from-blue-500 to-blue-600 after:from-blue-500/40 after:to-blue-500/40 hover:shadow-blue-500/20'
          fullWidth
          size='lg'
          type='submit'
          isLoading={loading}
          disabled={turnstileToken === '' || !REGEX_EMAIL.test(email)}
        >
          {t('app.auth.sendOtp')}
        </Button>
      </div>
    </form>
  )
}

export default EmailBox
