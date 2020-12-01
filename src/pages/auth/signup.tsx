import React, { useState } from 'react'
import { toSignup, TUserSignupDataInput } from '../../store/user/type'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import signupQuery from '../../schema/signup.graphql'
import { signup, signupVariables } from '../../schema/__generated__/signup'
import fp2 from 'fingerprintjs2'
import { sha256 } from 'js-sha256'
import { useAuthSuccessed, useSignupSuccess } from './hooks'
import { TUploadResponse, uploadImage } from '../../services/misc'
import swal from 'sweetalert'
import { useTitle } from '../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { useFormik } from 'formik'
import * as Yup from 'yup'
const styles = require('./auth.css').default

function Signup() {
  const [exec, result] = useMutation<signup, signupVariables>(signupQuery)
  const formik = useFormik({
    initialValues: {
      email: '',
      pwd: '',
      name: '',
      avatarFile: null as File | null
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      pwd: Yup.string().min(6).max(128).required(),
      name: Yup.string().max(128).required(),
      avatarFile: Yup.mixed().required()
    }),
    async onSubmit(values) {
      if (!formik.isValid) return
      if (!values.avatarFile) return

      const fpResult = await fp2.getPromise({ excludes: { userAgent: true } })
      const fp = (fpResult.find(x => x.key === 'canvas') as fp2.Component)
        .value[1].split(',')[1]

      let resp: TUploadResponse

      try {
        resp = await uploadImage(values.avatarFile)
      } catch (e) {
        swal({
          icon: 'error',
          title: "upload image failed"
        })
        throw e
      }

      exec({
        variables: {
          payload: {
            email: values.email,
            password: values.pwd,
            name: values.name,
            fingerPrint: fp,
            avatarUrl: resp.filePath
          }
        }
      })
    }
  })

  useAuthSuccessed(result.called, result.loading, result.error, result.data?.signup)
  const { t } = useTranslation()

  useTitle('signup')
  const formDisabled = formik.isSubmitting || (!formik.isValid)

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>邮箱: </label>
        <input
          type="email"
          className={styles.input}
          value={formik.values.email}
          placeholder="email"
          name='email'
          onChange={formik.handleChange}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>密码: </label>
        <input
          type="password"
          className={styles.input}
          value={formik.values.pwd}
          minLength={6}
          placeholder="password"
          name='pwd'
          onChange={formik.handleChange}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>用户名: </label>
        <input
          type="text"
          className={styles.input}
          value={formik.values.name}
          placeholder={t('app.auth.username')}
          name='name'
          onChange={formik.handleChange}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="avatar" className={styles.label}>头像: </label>
        <input
          type="file"
          className={styles.input}
          accept="image/png, image/jpeg"
          placeholder={t('app.auth.avatar')}
          onChange={e => {
            if (!e.target.files) {
              return
            }
            const f = e.target.files[0]
            formik.setFieldValue('avatarFile', f)
          }}
        />
      </div>

      {result.error && (
        <h5 className='bg-red-600 text-white p-4 rounded w-full text-xl'>{result.error?.message}</h5>
      )}
      <button
        className={'mt-4 text-gray-100 text-3xl rounded-lg p-4 duration-300 ' + (formDisabled ? 'bg-gray-400' : 'bg-blue-400 hover:bg-blue-600')}
        type="submit"
      >
        let me in
      </button>
    </form>
  )
}

export default Signup
