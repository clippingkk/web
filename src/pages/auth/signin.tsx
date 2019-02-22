import React, { useState } from 'react'
import { toLogin } from '../../store/user/type';
import { connect } from 'react-redux';
const styles = require('./auth.css')

type TSigninProps = {
  path: string,
  login: (email: string, pwd: string) => void 
}

function mapActionToProps() {
  return (dispatch: any) => ({
    login: (email: string, pwd: string) => dispatch(toLogin(email, pwd)),
  })
}

function Signin(props: TSigninProps) {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')

  const isDisabled = email === '' || pwd === ''

  function signin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isDisabled) {
      return
    }
    props.login(email, pwd)
  }

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
      <button
        className={styles.submitBtn}
        type="submit"
        disabled={isDisabled}
      >
        let me in
      </button>
    </form>
  )
}

export default connect(null, mapActionToProps)(Signin)
