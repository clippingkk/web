import React from 'react'
import NavigationBar from '../navigation-bar/navigation-bar'
import Footer from '../footer/Footer'
import SearchBar from '../searchbar/searchbar'

import styles from './container.module.css'

// const defaultBg = require('../../assets/bg.jpg').default

function DashboardContainer(props: any) {
  // const { width, height } = window.screen
  const containerStyle = {
    // backgroundImage: `url(https://picsum.photos/${width}/${height}/?blur=10)`
    // backgroundImage: `url(${defaultBg})`
  }
  // TODO: 预处理
  // https://lokeshdhakar.com/projects/color-thief/#getting-started
  // + dark theme or light theme
  return (
    <section className={styles.container + ' w-full flex flex-col  anna-page-container'} style={containerStyle}>
      <NavigationBar />
      <div className=' container flex-col flex m-auto'>
      {props.children}
      </div>
      <Footer />
      <SearchBar />
    </section>
  )
}

export default DashboardContainer
