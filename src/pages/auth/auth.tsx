import React from 'react'
import Card from '../../components/card/card'
import { connect } from 'react-redux'
import { toLogin } from '../../store/user/type'
import { navigate } from '@reach/router';
import swal from 'sweetalert';
const styles = require('./auth.css')

function mapStoreToProps({ user }: any) {
  return { uid: user.profile.id }
}

// @ts-ignore
@connect(
  mapStoreToProps,
  dispatch => ({
    login: (email: string, pwd: string) => dispatch(toLogin(email, pwd)),
  })
)
class AuthPage extends React.PureComponent<any, any> {
  state = {
    email: '',
    pwd: '',
  }

  private auth = async (e: React.FormEvent) => {
    e.preventDefault()

    await this.showMobileAlert()
    this.props.login(this.state.email, this.state.pwd)
  }

  // detect mobile and show alert tell user mobile is not a good way
  async showMobileAlert() {
    if (screen.width > 720) {
      return Promise.resolve(null)
    }
    return swal({
      title: '敬告',
      text: '手机体验很差哦，建议切换到电脑访问： https://kindle.annatarhe.com',
      icon: 'info'
    })
  }

  componentDidMount() {
    this.showMobileAlert()
    const uid = this.props.uid
    if (uid !== 0) {
      return navigate(`/dash/${uid}/home`)
    }
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
