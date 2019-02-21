import React from 'react'
import Card from '../../components/card/card'
import { AnimateOnChange } from '@nearform/react-animation'
import { navigate, Link } from '@reach/router';
import swal from 'sweetalert';
const styles = require('./auth.css')

function mapStoreToProps({ user }: any) {
  return { uid: user.profile.id }
}

function checkIsCurrentPath({ isCurrent }: any) {
  return {
    className: `${styles.tab} ${isCurrent ? styles.linkActive : ''}`
  }
}

class AuthPage extends React.PureComponent<any, any> {
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
    if (uid && uid !== 0) {
      return navigate(`/dash/${uid}/home`)
    }
  }

  render() {
    return (
      <section className={styles.auth}>
        <Card>
          <div className={styles.tabs}>
            <Link
              to="/auth/signup"
              className={styles.tab}
              getProps={checkIsCurrentPath}
            >注册</Link>
            <Link
              to="/auth/signin"
              className={styles.tab}
              getProps={checkIsCurrentPath}
            >登陆</Link>
          </div>
          <hr />
            {this.props.children}
        </Card>
      </section>
    )
  }
}

export default AuthPage
