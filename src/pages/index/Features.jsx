import React from 'react'

import styles from './Features.css'

const feats = [{
  img: 'https://github.com/AnnatarHe/kindle-viewer/raw/master/assets/index-page.jpg',
  title: 'Elegant',
  sub: 'Very simple, just clips and you.'
}, {
  img: 'https://github.com/AnnatarHe/kindle-viewer/raw/master/assets/list-clips.jpg',
  title: 'Modern',
  sub: 'Build with Windows 10 UWP, modern visual for modern you.'
}, {
  img: 'https://github.com/AnnatarHe/kindle-viewer/raw/master/assets/detail-clip.jpg',
  title: 'Powerful',
  sub: 'Drop your clips file and everything should be fine.'
}]

class Features extends React.PureComponent {

  renderFeatures = () => {
    return feats.map((f, i) => (
      <div className={styles.feature} key={i}>
        <div className={styles.describes}>
          <h3 className={styles.title}>{f.title}</h3>
          <p className={styles.sub}>{f.sub}</p>
        </div>
        <div className={styles.featImage}>
          <img src={f.img} className={styles.img}/>
        </div>
      </div>
    ))
  }

  render() {
    return (
      <section className={styles.container}>
        <h2 className={styles.h2}>Features</h2>
        <div className={styles.features}>
        {this.renderFeatures()}
        </div>
      </section>
    )
  }
}

export default Features
