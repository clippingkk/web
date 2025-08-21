'use client'
import { useMemo } from 'react'

type PageContainerProps = {
  bgImage?: string | { src: string; blurHash: string }
  children: React.ReactElement
}

function PageContainer(props: PageContainerProps) {
  const containerStyle = useMemo<React.CSSProperties | undefined>(() => {
    let backgroundImage: string | undefined
    const bgImg = props.bgImage
    if (!bgImg) {
      return undefined
    }
    if (typeof bgImg === 'string') {
      backgroundImage = `url(${bgImg})`
    }

    if (typeof bgImg === 'object') {
      backgroundImage = `url(${bgImg.src})`
    }
    return {
      backgroundImage,
    }
  }, [props.bgImage])
  return (
    <section
      className='flex min-h-screen w-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat'
      style={containerStyle}
    >
      <div className='dark:bg-opacity-80 bg-opacity-60 flex min-h-screen w-screen flex-col items-center justify-center bg-gray-400 backdrop-blur-xl dark:bg-gray-900'>
        {props.children}
      </div>
    </section>
  )
}
export default PageContainer
