import React from 'react'
import { Link } from '@reach/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect } from 'react-redux'
import { execLogout } from '../../store/user/type';
import Tooltip from 'rc-tooltip'
import Unauthed from './unauthed';
const styles = require('./navigation-bar.css')

const leftMenu = [
  {
    emoji: '📙',
    alt: '我的已读',
    dest: (id: number) => `/dash/${id}/home`,
  },
  {
    emoji: '🎪',
    alt: '广场',
    dest: (id: number) => `/dash/${id}/square`,
  },
  {
    emoji: '🎈',
    alt: '上传',
    dest: (id: number) => `/dash/${id}/upload`,
  },
  {
    emoji: '👼',
    alt: '我的信息',
    dest: (id: number) => `/dash/${id}/profile`,
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
            src={require('../../assets/logo.png')}
            alt="clippingkk logo"
            className={styles.logo}
          />
          <ul className='flex'>
            {leftMenu.map((item, index) => (
              <li className='mr-6' key={index}>
                <Tooltip placement='bottom' overlay={<span>{item.alt}</span>}>
                  <Link to={item.dest(this.props.id)}>
                    <span className='text-4xl'>
                      {item.emoji}
                    </span>
                  </Link>
                </Tooltip>
              </li>
            ))}
          </ul>
        </div>
        <ul className='flex'>
          <li className='mr-6'>
            <Tooltip placement='bottom' overlay={<span>设置</span>}>
              <span className='text-4xl'>🛠</span>
            </Tooltip>
          </li>
          <li className='mr-6' onClick={this.logout}>
            <Tooltip placement='bottom' overlay={<span>退出</span>}>
              <span className='text-4xl'>👋</span>
            </Tooltip>
          </li>
        </ul>
      </nav>
    )
  }
}

export default NavigationBar
