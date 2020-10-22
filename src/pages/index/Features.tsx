import React from 'react'
const styles = require('./Features.css').default

const feats = [
  {
    img:
      'https://github.com/AnnatarHe/kindle-viewer/raw/master/assets/index-page.jpg',
    title: '清爽',
    sub: '简单，直接，高效, 无推送, 无骚扰',
  },
  {
    img:
      'https://github.com/AnnatarHe/kindle-viewer/raw/master/assets/list-clips.jpg',
    title: '现代',
    sub: '专为现代平台开发，效果丰富，体验良好',
  },
  {
    img:
      'https://github.com/AnnatarHe/kindle-viewer/raw/master/assets/detail-clip.jpg',
    title: '强大',
    sub: '拖入 My Clippings.txt 即可，web 与小程序版本同步',
  },
  {
    img:
      'https://github.com/clippingkk/clippingkk-mobile/raw/master/docs/flutter_01.png',
    title: '跨平台',
    sub: '提供 Web, 小程序，及 Android 和 Windows UWP 版本',
  },
]

class Features extends React.PureComponent {
  renderFeatures = () => {
    return feats.map((f, i) => (
      <div className={styles.feature + ' flex flex-col items-center justify-between hover:bg-gray-300 p-8 md:px-20 md:py-20 md:flex-row'} key={i}>
        <div className={styles.describes}>
          <h3 className={styles.title}>{f.title}</h3>
          <p className={styles.sub}>{f.sub}</p>
        </div>
        <div className={styles.featImage}>
          <img src={f.img} className={styles.img} />
        </div>
      </div>
    ))
  }

  render() {
    return (
      <section className={styles.container}>
        <h2 className={styles.h2}>Features</h2>
        <div className={styles.features}>{this.renderFeatures()}</div>
      </section>
    )
  }
}

export default Features
