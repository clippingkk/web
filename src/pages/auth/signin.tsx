import React, { useEffect, useState } from 'react'
import authQuery from '../../schema/auth.graphql'
import { useLazyQuery } from '@apollo/client'
import { auth } from '../../schema/__generated__/auth'
import { authVariables } from '../../schema/__generated__/auth'
import { useAuthSuccessed } from './hooks';
import { useTitle } from '../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { useFormik } from 'formik'
import FieldInput from './input'
import * as Yup from 'yup'

type TSigninProps = {
  path: string,
}

function Signin(props: TSigninProps) {
  const [exec, resp] = useLazyQuery<auth, authVariables>(authQuery)
  useAuthSuccessed(resp.called, resp.loading, resp.error, resp.data?.auth)

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
      exec({
        variables: {
          email: values.email,
          password: values.pwd
        }
      })
    }
  })

  useTitle('signin')
  const { t } = useTranslation()

  const formDisabled = formik.isSubmitting || (!formik.isValid)

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
      {resp.error && (
        <h5 className='bg-red-600 text-white p-4 rounded w-full text-xl'>{resp.error?.message}</h5>
      )}
      <button
        className={'mt-4 text-gray-100 text-3xl rounded-lg p-4 duration-300 ' + (formDisabled ? 'bg-gray-400' : 'bg-blue-400 hover:bg-blue-600')}
        type="submit"
      >
        {t('app.auth.submit')}
      </button>
    </form>
  )
}

export default Signin
