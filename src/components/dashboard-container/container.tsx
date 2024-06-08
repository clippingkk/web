'use client';
import React, { useMemo } from 'react'
import NavigationBar from '../navigation-bar/navigation-bar'
import Footer from '../footer/Footer'

import { useAtomValue } from 'jotai'
import { appBackgroundAtom } from '../../store/global'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '../../schema/generated';
import { skipToken, useSuspenseQuery } from '@apollo/client';

const defaultBg = require('../../assets/bg.jpg').default

type DashboardContainerProps = {
  uidOrDomain?: number | string
  header?: React.ReactNode
  children?: React.ReactNode
}

function DashboardContainer(props: DashboardContainerProps) {
  const { uidOrDomain } = props
  const bg = useAtomValue(appBackgroundAtom)

  const isUidType = !Number.isNaN(parseInt(props.uidOrDomain as string))
  const { data: myProfile } = useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, uidOrDomain ? {
    variables: {
      id: isUidType ? ~~uidOrDomain : undefined,
      domain: isUidType ? undefined : String(uidOrDomain)
    }
  } : skipToken)

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
        {props.header ?? <NavigationBar myProfile={myProfile?.me} />}
        <div className=' container flex-col flex m-auto'>
          {props.children}
        </div>
        <Footer />
      </div>
    </section>
  )
}

export default DashboardContainer
