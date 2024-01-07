'use client'
import React, { useState } from 'react'
import { useAuthSuccessed } from '../../../hooks/hooks';
import { useTitle } from '../../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Turnstile from 'react-turnstile'
import { CF_TURNSTILE_SITE_KEY } from '../../../constants/config'
import toast from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../services/misc'
import { useAuthLazyQuery } from '../../../schema/generated';
import { Button, Input, InputWrapper } from '@mantine/core';

const isProd = process.env.NODE_ENV === 'production'

function SigninPageContent() {
  const [exec, resp] = useAuthLazyQuery()
  useAuthSuccessed(resp.called, resp.loading, resp.error, resp.data?.auth)
  const [turnstileToken, setTurnstileToken] = useState('')

  const formik = useFormik({
    initialValues: {
      email: '',
      pwd: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      pwd: Yup.string().min(6).max(128).required(),
    }),
    onSubmit(values) {
      if (!formik.isValid) return
      return toast.promise(
        exec({
          variables: {
            email: values.email,
            password: values.pwd,
            cfTurnstileToken: turnstileToken
          }
        }),
        toastPromiseDefaultOption
      )
    }
  })

  useTitle('signin')
  const { t } = useTranslation()

  let formDisabled = formik.isSubmitting || (!formik.isValid) || turnstileToken === ''
  if (!isProd) {
    formDisabled = false
  }

  return (
    <form className='flex flex-col' onSubmit={formik.handleSubmit}>
      <Input.Wrapper label='Email' error={formik.errors.email}>
        <Input
          type='email'
          name='email'
          value={formik.values.email}
          error={formik.errors.email}
          placeholder='Email'
          size='xl'
          onChange={formik.handleChange}
        />
      </Input.Wrapper>
      <Input.Wrapper label='Password' error={formik.errors.pwd}>
        <Input
          type='password'
          size='xl'
          name='pwd'
          value={formik.values.pwd}
          error={formik.errors.pwd}
          placeholder='Password'
          onChange={formik.handleChange}
        />
      </Input.Wrapper>
      {isProd && (
        <Turnstile
          sitekey={CF_TURNSTILE_SITE_KEY}
          retry='auto'
          onVerify={t => setTurnstileToken(t)}
          className='mx-auto'
        />
      )}
      {resp.error && (
        <h5 className='bg-red-600 my-4 text-white p-4 rounded w-full text-xl'>{resp.error?.message}</h5>
      )}
      <Button
        variant='gradient'
        gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
        className='transition-all active:scale-95 duration-150 mt-8'
        fullWidth
        loading={resp.loading}
        disabled={formDisabled}
        h={48}
        type="submit"
      >
        {t('app.auth.submit')}
      </Button>
    </form>
  )
}

export default SigninPageContent
