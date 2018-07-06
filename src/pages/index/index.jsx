import React from 'react'
import Hero from './Hero'
import Features from './Features'
import Footer from './Footer'
import styles from './index.css'

class IndexPage extends React.PureComponent {
  render() {
    return (
      <div className={styles.container}>
        <Hero />
        <Features />
        <Footer />
      </div>
    )
  }
}

export default IndexPage
