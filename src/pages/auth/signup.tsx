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
const styles = require('./auth.css')

function Signup() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState({} as File)

  const isDisabled = email === '' || pwd === '' || name === '' || !avatarFile

  const [exec, result] = useMutation<signup, signupVariables>(signupQuery)

  async function signup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isDisabled) {
      return
    }
    const fpResult = await fp2.getPromise({ excludes: { userAgent: true } })

    const fp = (fpResult.find(x => x.key === 'canvas') as fp2.Component)
      .value[1].split(',')[1]

    let resp: TUploadResponse

    try {
      resp = await uploadImage(avatarFile)
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
          email,
          password: pwd,
          name: name,
          fingerPrint: fp,
          avatarUrl: resp.filePath
        }
      }
    })
  }

  useAuthSuccessed(result.called, result.loading, result.error, result.data?.signup)

  useTitle('signup')

  return (
    <form className={styles.form} onSubmit={signup}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>邮箱: </label>
        <input
          type="email"
          className={styles.input}
          value={email}
          placeholder="email"
          onChange={e => {
            setEmail(e.target.value)
          }}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>密码: </label>
        <input
          type="password"
          className={styles.input}
          value={pwd}
          minLength={6}
          placeholder="password"
          onChange={e => {
            setPwd(e.target.value)
          }}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>用户名: </label>
        <input
          type="text"
          className={styles.input}
          value={name}
          placeholder="用户名"
          onChange={e => {
            setName(e.target.value)
          }}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>头像: </label>
        <input
          type="file"
          className={styles.input}
          accept="image/png, image/jpeg"
          placeholder="头像"
          onChange={e => {
            if (!e.target.files) {
              return
            }
            const f = e.target.files[0]
            setAvatarFile(f)
          }}
        />
      </div>

      {result.error && (
        <h5 className='bg-red-600 text-white p-4 rounded w-full text-xl'>{result.error?.message}</h5>
      )}
      <button
        className='mt-4 bg-blue-600 text-gray-100 text-3xl rounded-lg p-4'
        type="submit"
        disabled={isDisabled}
      >
        let me in
      </button>
    </form>
  )
}

export default Signup
