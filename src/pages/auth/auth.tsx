import React from 'react'
import Card from '../../components/card/card'
import { connect } from 'react-redux'
import { toLogin } from '../../store/user/type'
import { hot } from 'react-hot-loader'
const styles = require('./auth.css')

// @ts-ignore
@connect(
  () => ({}),
  dispatch => ({
    login: (email: string, pwd: string) => dispatch(toLogin(email, pwd)),
  })
)
class AuthPage extends React.PureComponent<any, any> {
  state = {
    email: '',
    pwd: '',
  }

  private auth = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.login(this.state.email, this.state.pwd)
  }

  render() {
    return (
      <section className={styles.auth}>
        <Card>
          <h2>Auth</h2>
          <hr />

          <form className={styles.form} onSubmit={this.auth}>
            <div className={styles.field}>
              <input
                type="email"
                className={styles.input}
                value={this.state.email}
                placeholder="email"
                onChange={e => {
                  this.setState({ email: e.target.value })
                }}
              />
            </div>
            <div className={styles.field}>
              <input
                type="password"
                className={styles.input}
                value={this.state.pwd}
                placeholder="password"
                onChange={e => {
                  this.setState({ pwd: e.target.value })
                }}
              />
            </div>
            <button className={styles.submitBtn} type="submit">
              let me in
            </button>
          </form>
        </Card>
      </section>
    )
  }
}

export default AuthPage
