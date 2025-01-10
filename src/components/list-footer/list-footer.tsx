import React from 'react'
import { useInView } from 'react-cool-inview'

type TListFooterProp = {
  loadingBlock?: React.ReactElement
  loadMoreFn: () => any
  hasMore: boolean
}

function ListFooter(props: TListFooterProp) {
  const { loadMoreFn, hasMore, loadingBlock } = props
  const { observe } = useInView({
    rootMargin: '50px 0px',
    onEnter: ({ unobserve }) => {
      if (!hasMore) {
        return
      }
      loadMoreFn()
    },
  })
  return (
    <footer className='flex justify-center items-center my-4 mx-0 w-full'>
      <div
        className='text-gray-600 dark:text-gray-400 block w-full text-center'
        ref={observe}
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
