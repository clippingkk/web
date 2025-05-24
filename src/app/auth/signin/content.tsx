'use client'
import Button from '@/components/button/button'
import { CF_TURNSTILE_SITE_KEY } from '@/constants/config'
import { useAuthSuccessed } from '@/hooks/hooks'
import { useTitle } from '@/hooks/tracke'
import { useTranslation } from '@/i18n/client'
import { useAuthLazyQuery } from '@/schema/generated'
import InputField from '@annatarhe/lake-ui/form-input-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const isProd = process.env.NODE_ENV === 'production'
const signinSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  pwd: z.string().min(6, 'Password must be at least 6 characters').max(128),
})

type SigninFormData = z.infer<typeof signinSchema>

function SigninPageContent() {
  const [exec, resp] = useAuthLazyQuery()
  useAuthSuccessed(resp.called, resp.loading, resp.error, resp.data?.auth)
  const [turnstileToken, setTurnstileToken] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    mode: 'onChange',
  })

  const onSubmit = (values: SigninFormData) => {
    if (!isValid) return
    return exec({
      variables: {
        email: values.email,
        password: values.pwd,
        cfTurnstileToken: turnstileToken,
      },
    })
  }

  useTitle('signin')
  const { t } = useTranslation()

  const formDisabled = isProd
    ? isSubmitting || !isValid || turnstileToken === ''
    : false

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <InputField
            label="Email"
            placeholder="Email"
            error={errors.email?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="pwd"
        control={control}
        render={({ field }) => (
          <InputField
            label="Password"
            placeholder="Password"
            type="password"
            error={errors.pwd?.message}
            {...field}
          />
        )}
      />
      {isProd && (
        <Turnstile
          siteKey={CF_TURNSTILE_SITE_KEY}
          onSuccess={(t) => setTurnstileToken(t)}
          className="mx-auto"
        />
      )}
      {resp.error && (
        <h5 className="my-4 w-full rounded-sm bg-red-600 p-4 text-xl text-white">
          {resp.error?.message}
        </h5>
      )}
      <Button
        variant="primary"
        className="mt-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 before:from-indigo-500 before:to-cyan-500"
        fullWidth
        isLoading={resp.loading || isSubmitting}
        disabled={formDisabled}
        size="xl"
        type="submit"
      >
        {t('app.auth.submit')}
      </Button>
    </form>
  )
}

export default SigninPageContent
