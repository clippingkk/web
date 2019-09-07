import React from 'react'
import NavigationBar from '../navigation-bar/navigation-bar'
import Footer from '../footer/Footer'
import { connect } from 'react-redux'
import { TGlobalStore } from '../../store'

const styles = require('./container.css')

function mapStoreToState({ app }: TGlobalStore) {
  return {
    background: app.background,
  }
}

type TContainerProps = {
  background: string
}

// @ts-ignore
@connect(mapStoreToState)
class Container extends React.PureComponent<TContainerProps> {
  render() {
    const { background, children } = this.props
    // const containerStyle =
    //   background ? {
    //     backgroundImage: `url(${background})`,
    //   } : undefined
    const { width, height } = window.screen
    const containerStyle = {
      backgroundImage: `url(https://picsum.photos/${width}/${height}/?blur=10)`
    }
    return (
      <section className={styles.container}>
        <div className={styles.back} style={containerStyle} />
        <NavigationBar />
        {children}
        <Footer />
      </section>
    )
  }
}

export default Container
