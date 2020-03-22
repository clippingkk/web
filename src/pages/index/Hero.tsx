import React from 'react'
import swal from 'sweetalert';
const styles = require('./Hero.css')

function VideoTipsArea() {
  return (
    <div className={styles['video-tips']}>
      <iframe
        src="//player.bilibili.com/player.html?aid=44625474&cid=78121984&page=1"
        scrolling="no"
        allow="fullscreen"
        className={styles.video}
      />
    </div>
  )
}

enum platformList {
  'Windows',
  'iOS',
  'Android',
  // 'macOS',
  'web',
}

type IPlatformItem = {
  [k in keyof typeof platformList]: {
    url?: string
  }
}

const platforms: IPlatformItem = {
  Windows: {
    url: 'https://www.microsoft.com/store/apps/9NMPMXC5X2CM',
  },
  iOS: {},
  Android: {
    url: 'https://www.coolapk.com/apk/219832'
  },
  web: {
    url: '/auth/signin'
  },
  // macOS: {},
}

class Hero extends React.PureComponent {
  state = {
    linkUrl: platforms.Windows.url,
  }

  componentDidMount() {
    let deviceSpecUrl = platforms.Windows.url
    switch (navigator.platform.toLowerCase()) {
      case 'android':
        deviceSpecUrl = platforms.Android.url
      case 'win32':
      default:
    }

    this.setState({
      linkUrl: deviceSpecUrl,
    })
  }

  showAlert(platform: platformList) {
    if (platforms[platform].url) {
      return
    }

    swal({
      title: `${platform} 暂未开放，敬请期待`,
      text: '目前 windows 平台已经有了 \n web 版本功能最为丰富 \n ios, android 版开发中，即将上线',
      icon: 'info'
    })
  }

  render() {
    return (
      <div className={'flex flex-col justify-center ' + styles.hero}>
        <div className={styles.titleField + ' my-20 mx-20 flex items-center justify-center flex-col md:flex-row'}>
          <div className={styles.info}>

            <h1 className={styles.title + ' mx-0 my-0 font-light text-white'}>ClippingKK</h1>
            <h4 className='text-white text-3xl'>整理, 展示, 复盘, 进步</h4>
            <div className={styles.platformSection}>
              <a
                href={platforms.web.url}
                target="_blank"
                className={styles['download-btn'] + ' py-4 px-12 text-6xl rounded-lg block font-light text-white my-6 hover:shadow-2xl'}
              >
                立即体验！
              </a>
              <ul className={styles.platformList}>
                {Object.keys(platforms).map((key: any) => (
                  <li key={key} className='ml-4'>
                    <a
                      className='text-white text-lg'
                      href={platforms[key].url ? platforms[key].url : '#'}
                      target={platforms[key].url ? '_blank' : ''}
                      onClick={() => { this.showAlert(key) }}
                    >
                      {key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <VideoTipsArea />

        </div>
      </div>
    )
  }
}

export default Hero
