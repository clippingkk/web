import React from 'react'
import { Link } from '@reach/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect } from 'react-redux'
import { execLogout } from '../../store/user/type';
const styles = require('./navigation-bar.css')

const leftMenu = [
  {
    icon: 'book',
    dest: (id: number) => `/dash/${id}/home`,
  },
  {
    icon: 'book-open',
    dest: (id: number) => `/dash/${id}/square`,
  },
  {
    icon: 'cloud-upload-alt',
    dest: (id: number) => `/dash/${id}/upload`,
  },
  {
    icon: 'user',
    dest: (id: number) => `/dash/${id}/home`,
  },
]

function mapStoreToState({ user, app }: any) {
  return {
    id: user.profile.id,
    name: user.profile.name,
  }
}

function mapActionToProps(dispatch: any) {
  return {
    logout: () => dispatch(execLogout())
  }
}

// @ts-ignore
@connect(mapStoreToState, mapActionToProps)
class NavigationBar extends React.PureComponent<any, any> {

  logout = () => {
    this.props.logout()
  }

  render() {
    return (
      <nav className={styles.navbar}>
        <div className={styles.menu}>
          <img
            src="https://via.placeholder.com/100/#2196f3e6?Text=clippingkk"
            alt="clippingkk logo"
            className={styles.logo}
          />
          <ul className={styles.menuUl}>
            {leftMenu.map((item, index) => (
              <li className={styles.menuItem} key={index}>
                <Link to={item.dest(this.props.id)}>
                  <FontAwesomeIcon
                    icon={item.icon as any}
                    color="#000"
                    size="2x"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <ul className={styles.settings}>
          <li className={styles.setting}>
            <FontAwesomeIcon icon="cog" color="#000" size="2x" />
          </li>
          <li className={styles.setting} onClick={this.logout}>
            <FontAwesomeIcon icon="sign-out-alt" color="#000" size="2x" />
          </li>
        </ul>
      </nav>
    )
  }
}

export default NavigationBar
