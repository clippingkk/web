import React, { useCallback, useEffect, useState } from 'react'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import Dialog from '../dialog/dialog'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const styles = require('./preview.css').default

type PreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: fetchClipping_clipping
  book: WenquBook | null
}

function Preview(props: PreviewProps) {
  const [shareURL, setShareURL] = useState('')
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState('')

  const onImageLoad = useCallback((e) => {
    setLoading(false)
  }, [])
  const onImageError = useCallback((e) => {
    console.log(e)
    toast.error(e.toString())
    setLoading(false)
    setErrMsg('')
  }, [])

  useEffect(() => {
    if (!props.book) {
      return
    }
    const data = {
      // id: props.clipping.id,
      // avatar: props.clipping.creator.avatar,
      // un: props.clipping.creator.name,
      // time: (new Date(props.clipping.createdAt)).getTime(),
      // content: props.clipping.content,
      // bt: props.book.title,
      // author: props.book.author,
      cid: props.clipping.id,
      bid: props.book.id,
      uid: props.clipping.creator.id,
    }

    const d = new URLSearchParams(data as any)
    const distUrl = encodeURIComponent(`https://konzert.annatarhe.com/clipping.html?${d.toString()}`)

    const screenWidth = screen.width > 375 ? 375 : screen.width
    const dpi = 3
    
    setShareURL(`https://utp.annatarhe.com/?url=${distUrl}&isMobile=true&isFullPage=true&viewPortWidth=${screenWidth}&width=${screenWidth * dpi}&deviceScaleFactor=${dpi}&viewPortHeight=812`)
    setLoading(true)
    setErrMsg('')
  }, [props.clipping.id, props.book?.id])

  const { t } = useTranslation()
  return (
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <section className={styles.preview}>
        <img
          src={shareURL}
          onLoad={onImageLoad}
          onError={onImageError}
          className={styles['preview-image'] + ' transition-all duration-300'}
        />
        <footer className={styles.footer}>
          <a
            href={shareURL}
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-${props.clipping.id}.png`}
            className={styles.action + ' ' + styles.download}
            target='_blank'
          >
            {t('app.clipping.save')}
          </a>
        </footer>
      </section>
    </Dialog>
  )
}

export default Preview
