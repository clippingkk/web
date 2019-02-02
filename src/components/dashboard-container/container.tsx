import React from 'react'
import NavigationBar from '../navigation-bar/navigation-bar';
import Footer from '../footer/Footer';
import { connect } from 'react-redux';
import { TGlobalStore } from '../../store';
const styles = require('./container.css')

function mapStoreToState({ app }: TGlobalStore) {
  return {
    background: app.background
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
    return (
    <section className={styles.container}>
      <div className={styles.back} style={{ backgroundImage: `url(${background})` }}/>
      <NavigationBar />
      {children}
      <Footer />
    </section>
    )
  }
}

export default Container
