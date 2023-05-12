'use client'
import React, { useState } from 'react'
import Head from 'next/head'
import { useAuthSuccessed } from '../../../hooks/hooks';
import { useTitle } from '../../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { useFormik } from 'formik'
import FieldInput from '../../../components/input'
import * as Yup from 'yup'
import OGWithAuth from '../../../components/og/og-with-auth'
import Turnstile from 'react-turnstile'
import { CF_TURNSTILE_SITE_KEY } from '../../../constants/config'
import toast from 'react-hot-toast'
import { toastPromiseDefaultOption } from '../../../services/misc'
import { useAuthLazyQuery } from '../../../schema/generated';

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
      <FieldInput
        type='email'
        name='email'
        value={formik.values.email}
        error={formik.errors.email}
        onChange={formik.handleChange}
      />
      <FieldInput
        type='password'
        name='pwd'
        value={formik.values.pwd}
        error={formik.errors.pwd}
        onChange={formik.handleChange}
      />
      {isProd && (
        <Turnstile
          sitekey={CF_TURNSTILE_SITE_KEY}
          onVerify={t => setTurnstileToken(t)}
          className='mx-auto'
        />
      )}
      {resp.error && (
        <h5 className='bg-red-600 text-white p-4 rounded w-full text-xl'>{resp.error?.message}</h5>
      )}
      <button
        className='text-white w-full rounded bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300 mt-4'
        disabled={formDisabled}
        type="submit"
      >
        {t('app.auth.submit')}
      </button>
    </form>
  )
}

export default SigninPageContent
