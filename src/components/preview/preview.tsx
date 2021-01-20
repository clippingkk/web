import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Dialog from '../dialog/dialog'
import { HtmlPostShareRender } from '../../utils/canvas/HtmlPostShareRender'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
import { TGlobalStore } from '../../store'
import { UserContent } from '../../store/user/type'
import { useTranslation } from 'react-i18next'
import { delay } from '../../utils/timer'
import swal from 'sweetalert'
const styles = require('./preview.css').default

type TPreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: fetchClipping_clipping
  book: WenquBook | null
}

function Preview(props: TPreviewProps) {
  const [imageData, setImageData] = useState('')
  const user = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const [imageHeight, setImageHeight] = useState(812)

  const doRender = useCallback(async () => {
    if (!props.book) {
      return
    }

    const cvs = document.createElement('canvas')
    const postRender = new HtmlPostShareRender(cvs, {
      height: 812,
      width: 375,
      dpr: 3,
      clipping: props.clipping,
      bookInfo: props.book,
      baseTextSize: 24,
      padding: 24,
      textFont: ['MaShanZheng', 'STKaiTi', 'KaiTi'],
    })

    postRender.setup()
    await postRender.renderBackground()
    await postRender.renderText()
    await postRender.renderTitle()
    await postRender.renderAuthor()
    await postRender.renderBanner()
    await postRender.renderMyInfo(user)
    await postRender.renderQRCode()
    await postRender.resizePosterHeight()

    await postRender.renderBackground()
    await postRender.renderText()
    await postRender.renderTitle()
    await postRender.renderAuthor()
    await postRender.renderBanner()
    await postRender.renderMyInfo(user)
    await postRender.renderQRCode()

    const _imageData = await postRender.saveToLocal()

    setImageData(_imageData)
    setImageHeight(postRender.renderedHeight)
  }, [props.book, props.clipping, user])
  useEffect(() => {
    doRender()
  }, [doRender])

  const { t } = useTranslation()

  return (
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <section className={styles.preview}>
        <img
         src={imageData}
          className={styles['preview-image'] + ' transition-all duration-300'}
          style={{
            height: imageHeight + 'px'
          }}
         />
        <footer className={styles.footer}>
          <a
            href={imageData}
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-${props.clipping.id}.png`}
            className={styles.action + ' ' + styles.download}
          >
            {t('app.clipping.save')}
            </a>
        </footer>
      </section>
    </Dialog>
  )
}

export default Preview
