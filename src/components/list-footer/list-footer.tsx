import React, { useRef, useEffect } from 'react'
const styles = require('./list-footer.css')

type TListFooterProp = {
  loadMoreFn: () => Promise<any>
  hasMore: boolean
}

function useFooterLoadObs(loadMore: () => Promise<any>, hasMore: boolean) {
  const dom = useRef({} as HTMLSpanElement)

  useEffect(() => {
    const obs = new IntersectionObserver(() => {
      console.log('load more')
      if (!hasMore) {
        return
      }
      loadMore()
    })
    obs.observe(dom.current)
    return () => {
      obs.disconnect()
    }
  })

  return {
    dom
  }
}

function ListFooter({ loadMoreFn, hasMore }: TListFooterProp) {
  const { dom } = useFooterLoadObs(loadMoreFn, hasMore)
  return (
    <footer className={styles.footer}>
      <span
        className={styles.tip}
        ref={dom}
      >
        {hasMore ? 'loading' : '没有更多了...'}
      </span>
    </footer>
  )
}

export default ListFooter
