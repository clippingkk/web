import React from 'react'
import styles from './Footer.css'

class Footer extends React.PureComponent {
  render() {
    return (
      <footer className={styles.footer}>
        <a href="http://www.miitbeian.gov.cn/" target="_blank">豫ICP备15003571号</a>
        <a href="https://annatarhe.com" target="_blank">&copy; AnnatarHe</a>
      </footer>
    )
  }
}

export default Footer
