import React, { useEffect, useState } from 'react'
import authQuery from '../../schema/auth.graphql'
import { useLazyQuery } from '@apollo/client'
import { auth } from '../../schema/__generated__/auth'
import { authVariables } from '../../schema/__generated__/auth'
import { useAuthSuccessed } from './hooks';
import { useTitle } from '../../hooks/tracke'
const styles = require('./auth.css')

type TSigninProps = {
  path: string,
}

function Signin(props: TSigninProps) {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')

  const [exec, resp] = useLazyQuery<auth, authVariables>(authQuery)
  useAuthSuccessed(resp)

  function signin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isDisabled) {
      return
    }
    exec({
      variables: {
        email: email,
        password: pwd
      }
    })
  }

  useTitle('signin')

  const isDisabled = email === '' || pwd === '' || resp.loading

  return (
    <form className={styles.form} onSubmit={signin}>
      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>邮箱: </label>
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
        <label htmlFor="username" className={styles.label}>密码: </label>
        <input
          type="password"
          className={styles.input}
          value={pwd}
          placeholder="password"
          onChange={e => {
            setPwd(e.target.value)
          }}
        />
      </div>
      {resp.error && (
        <h5 className='bg-red-600 text-white p-4 rounded w-full text-xl'>{resp.error?.message}</h5>
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

export default Signin
