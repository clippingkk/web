import React from 'react'
const styles = require('./container.css')
import NavigationBar from '../navigation-bar/navigation-bar';
import Footer from '../footer/Footer';

function Container({ children }: any) {
  return (
    <section className={styles.container}>
      <NavigationBar />
      {children}
      <Footer />
    </section>
  )
}

export default Container
