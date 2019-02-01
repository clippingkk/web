import React from 'react'
const styles = require('./container.css')
import NavigationBar from '../navigation-bar/navigation-bar';

function Container({ children }: any) {
  return (
    <section className={styles.container}>
      <NavigationBar />
      <main>
        {children}
      </main>
    </section>
  )
}

export default Container
