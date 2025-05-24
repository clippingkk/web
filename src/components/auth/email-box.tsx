import { CF_TURNSTILE_SITE_KEY } from '@/constants/config'
import { useTranslation } from '@/i18n/client'
import { REGEX_EMAIL } from '@/services/regex'
import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'
import Button from '../button/button'

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
      className="w-full"
    >
      <fieldset className="mb-10 w-full">
        <label
          htmlFor="email"
          className="mb-2 text-lg text-gray-100 capitalize"
        >
          {t('app.auth.email')}
        </label>
        <input
          type="email"
          placeholder="email@gmail.com"
          className="bg-opacity-90 w-full rounded-sm bg-gray-100 px-2 py-4"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
        />
      </fieldset>
      <fieldset>
        <Turnstile
          siteKey={CF_TURNSTILE_SITE_KEY}
          onSuccess={(t) => setTurnstileToken(t)}
          className="mx-auto"
        />
      </fieldset>
      <div className="mt-4 w-full">
        <Button
          className="bg-gradient-to-br from-blue-500 to-blue-600 after:from-blue-500/40 after:to-blue-500/40 hover:shadow-blue-500/20"
          fullWidth
          size="lg"
          type="submit"
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
