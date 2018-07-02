import React from 'react'
import { hot } from 'react-hot-loader'
import styles from './Root.css'

import IndexPage from './pages/index/index'

const Root = () => {
    return (
      <div className={styles.container}>
        <IndexPage />
      </div>
    )
}

export default hot(module)(Root)
