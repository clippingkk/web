import React from 'react'
import { useMutation } from '@apollo/client'
import signupQuery from '../../schema/signup.graphql'
import { signup, signupVariables } from '../../schema/__generated__/signup'
import fp2 from '@fingerprintjs/fingerprintjs'
import { useAuthSuccessed, useSignupSuccess } from '../../hooks/hooks'
import { TUploadResponse, uploadImage } from '../../services/misc'
import swal from 'sweetalert'
import { useTitle } from '../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import FieldInput from '../../components/input'

function Signup() {
  const [exec, result] = useMutation<signup, signupVariables>(signupQuery)
  const formik = useFormik({
    initialValues: {
      email: '',
      pwd: '',
      username: '',
      avatar: null as File | null
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      pwd: Yup.string().min(6).max(128).required(),
      username: Yup.string().max(128).required(),
      avatar: Yup.mixed().required()
    }),
    async onSubmit(values) {
      if (!formik.isValid) return
      if (!values.avatar) return

      const fpResult = await fp2.getPromise({ excludes: { userAgent: true } })
      const fp = (fpResult.find(x => x.key === 'canvas') as fp2.Component)
        .value[1].split(',')[1]

      let resp: TUploadResponse

      try {
        resp = await uploadImage(values.avatar)
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
            name: values.username,
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
    <form className='flex flex-col' onSubmit={formik.handleSubmit}>
      <FieldInput
        type='email'
        name='email'
        onChange={formik.handleChange}
        error={formik.errors.email}
        value={formik.values.email}
      />
      <FieldInput
        type='password'
        name='pwd'
        onChange={formik.handleChange}
        error={formik.errors.pwd}
        value={formik.values.pwd}
      />
      <FieldInput
        name='username'
        error={formik.errors.username}
        onChange={formik.handleChange}
        value={formik.values.username}
      />
      <FieldInput
        type='file'
        name='avatar'
        error={formik.errors.avatar}
        onChange={e => {
          if (!e.target.files) {
            return
          }
          const f = e.target.files[0]
          formik.setFieldValue('avatar', f)
        }}
        inputProps={{
          accept: "image/png, image/jpeg"
        }}
        value={undefined}
      />

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
