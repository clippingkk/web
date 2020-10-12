import React, { useRef, useEffect } from 'react'

type TListFooterProp = {
  loadMoreFn: () => any
  hasMore: boolean
}

function useFooterLoadObs(loadMore: () => Promise<any>, hasMore: boolean) {
  const dom = useRef({} as HTMLSpanElement)

  useEffect(() => {
    const obs = new IntersectionObserver((entities) => {
      const entity = entities[0]

      if (!hasMore || entity.intersectionRatio < 0.8) {
        return
      }
      loadMore()
    })
    obs.observe(dom.current)
    return () => {
      obs.disconnect()
    }
  }, [hasMore, loadMore])

  return {
    dom
  }
}

function ListFooter({ loadMoreFn, hasMore }: TListFooterProp) {
  const { dom } = useFooterLoadObs(loadMoreFn, hasMore)
  return (
    <footer className='flex justify-center items-center my-4 mx-0 w-full'>
      <span
        className='text-gray-600 dark:text-gray-400 block'
        ref={dom}
      >
        {hasMore ? 'loading' : '没有更多了...'}
      </span>
    </footer>
  )
}

export default ListFooter
