import React from 'react'
import styles from './index.css'

class IndexPage extends React.PureComponent {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.titleField}>
            <h1 className={styles.title}>
              Kindle Viewer
            </h1>
            <h4 className={styles.subTitle}>
              A new Vision to read
            </h4>
            <a href="javascript:;" className={styles.downloadBtn}>Download now</a>
          </div>
        </div>
      </div>
    )
  }
}

export default IndexPage
