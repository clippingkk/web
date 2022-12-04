import React, { useMemo } from 'react'
import NavigationBar from '../navigation-bar/navigation-bar'
import Footer from '../footer/Footer'

import styles from './container.module.css'
import { useAtomValue } from 'jotai'
import { appBackgroundAtom } from '../../store/global'

const defaultBg = require('../../assets/bg.jpg').default

function DashboardContainer(props: any) {
  const bg = useAtomValue(appBackgroundAtom)
  const containerStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!bg) {
      return undefined
    }
    return {
      // backgroundImage: `url(https://picsum.photos/${width}/${height}/?blur=10)`
      backgroundImage: `url(${bg})`,
    }
  }, [bg])
  // TODO: 预处理
  // https://lokeshdhakar.com/projects/color-thief/#getting-started
  // + dark theme or light theme
  return (
    <section className={'min-h-screen w-full flex flex-col anna-page-container bg-no-repeat bg-cover'} style={containerStyle}>
      <div className=' min-h-screen w-full flex flex-col  backdrop-blur-xl bg-gray-400 dark:bg-gray-900 dark:bg-opacity-80 bg-opacity-60'>
        <NavigationBar />
        <div className=' container flex-col flex m-auto'>
          {props.children}
        </div>
        <Footer />
      </div>
    </section>
  )
}

export default DashboardContainer
