import React from 'react'

type MasonryContainerProps = {
  children: React.ReactElement
}

function MasonryContainer(props: MasonryContainerProps) {
  return (
    <div className='masonry-1 lg:masonry-2 xl:masonry-3 masonry-gap-4 mb-16'>
      {props.children}
    </div>
  )
}

export default MasonryContainer
