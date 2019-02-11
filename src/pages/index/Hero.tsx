import React from 'react'
const styles = require('./Hero.css')

enum platformList {
  'Windows',
  'iOS',
  'Android',
  'macOS',
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
  Android: {},
  web: {
    url: '/auth'
  },
  macOS: {},
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

  render() {
    return (
      <div className={styles.hero}>
        <div className={styles.titleField}>
          <h1 className={styles.title}>ClippingKK</h1>
          <h4 className={styles.subTitle}>A new Vision to read</h4>
          <div className={styles.platformSection}>
            <a
              href="https://www.microsoft.com/store/apps/9NMPMXC5X2CM"
              target="_blank"
              className={styles.downloadBtn}
            >
              Download now
            </a>
            <ul className={styles.platformList}>
              {Object.keys(platforms).map((key: any) => (
                <li key={key} className={styles.platformItem}>
                  <a
                    className={styles.platformLink}
                    href={platforms[key].url ? platforms[key].url : '#'}
                    target="_blank"
                  >
                    {key}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default Hero
