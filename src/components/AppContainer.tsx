'use client'
import React from 'react'
import GlobalUpload from './uploads/global'

type AppContainerProps = {
  children: React.ReactElement
}

function AppContainer(props: AppContainerProps) {
  const globalRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      className='w-full h-full'
      ref={globalRef}
    >
      <>
        {props.children}
        <GlobalUpload ref={globalRef} />
      </>
    </div>
  )
}

export default AppContainer
