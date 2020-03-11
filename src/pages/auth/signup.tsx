import React, { useState } from 'react'
import { toSignup, TUserSignupDataInput } from '../../store/user/type'
import { connect } from 'react-redux'
const styles = require('./auth.css')

type TSignupProps = {
  path: string
  signup: (signupData: TUserSignupDataInput) => void 
}

function mapActionToProps() {
  return (dispatch: any) => ({
    signup: (signupData: TUserSignupDataInput) => dispatch(toSignup(signupData)),
  })
}

function Signup(props: TSignupProps) {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState({} as File)

  const isDisabled = email === '' || pwd === '' || name === '' || !avatarFile

  function signup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isDisabled) {
      return
    }
    props.signup({
      email, pwd, name, avatarFile
    })
  }

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

export default connect(null, mapActionToProps)(Signup)
