import type React from 'react'
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onEnter: ({ unobserve }) => {
      if (!hasMore) {
        return
      }
      loadMoreFn()
    },
  })
  return (
    <footer className="mx-0 my-4 flex w-full items-center justify-center">
      <div
        className="block w-full text-center text-gray-600 dark:text-gray-400"
        ref={observe}
      >
        {hasMore ? (loadingBlock ?? 'Loading') : 'You reach the end'}
      </div>
    </footer>
  )
}

export default ListFooter
