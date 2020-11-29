import React from 'react'
import { useTranslation } from 'react-i18next'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
import Dialog from '../dialog/dialog'
import domtoimage from 'dom-to-image'
const styles = require('./preview.css').default

type PreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: fetchClipping_clipping
  book: WenquBook | null
}

function Preview(props: PreviewProps) {
  const { t } = useTranslation()
  return (
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <section className={styles.preview}>
        <div>hello world</div>
      </section>
    </Dialog>
  )
}

export default Preview
