import React from 'react'
import NavigationBar from '../navigation-bar/navigation-bar'
import Footer from '../footer/Footer'
import { connect } from 'react-redux'
import { TGlobalStore } from '../../store'

const styles = require('./container.css')

function Container(props: any) {
  const { width, height } = window.screen
  const containerStyle = {
    backgroundImage: `url(https://picsum.photos/${width}/${height}/?blur=10)`
  }
  // TODO: 预处理
  // https://lokeshdhakar.com/projects/color-thief/#getting-started
  // + dark theme or light theme
  return (
    <section className={styles.container} style={containerStyle}>
      <NavigationBar />
      {props.children}
      <Footer />
    </section>
  )
}

export default Container
