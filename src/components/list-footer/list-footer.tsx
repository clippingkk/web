import React, { useRef, useEffect } from 'react'

type TListFooterProp = {
  loadingBlock?: React.ReactElement
  loadMoreFn: () => any
  hasMore: boolean
}

function useFooterLoadObs(loadMore: () => Promise<any>, hasMore: boolean) {
  const dom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver((entities) => {
      const entity = entities[0]

      if (!hasMore || entity.intersectionRatio <= 0) {
        return
      }
      loadMore()
    })
    if (!dom.current) {
      return
    }
    obs.observe(dom.current)
    return () => {
      obs.disconnect()
    }
  }, [hasMore, dom, loadMore])

  return {
    dom
  }
}

function ListFooter(props: TListFooterProp) {
  const { loadMoreFn, hasMore, loadingBlock } = props
  const { dom } = useFooterLoadObs(loadMoreFn, hasMore)
  return (
    <footer className='flex justify-center items-center my-4 mx-0 w-full'>
      <div
        className='text-gray-600 dark:text-gray-400 block w-full text-center'
        ref={dom}
      >
        {
          hasMore ?
            loadingBlock ?? 'Loading' :
            'You reach the end'
        }
      </div>
    </footer>
  )
}

export default ListFooter
