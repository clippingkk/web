import React, { useCallback, useEffect, useState } from 'react'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import Dialog from '../dialog/dialog'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp'
import ThemePicker from './theme-picker'
import styles from './preview.module.css'

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
  const [currentTheme, setCurrentTheme] = useState(KonzertThemeMap.young.id)

  const onImageLoad = useCallback((e: any) => {
    setLoading(false)
  }, [])
  const onImageError = useCallback((e: any) => {
    toast.error(e.toString())
    setLoading(false)
    setErrMsg('')
  }, [])

  useEffect(() => {
    if (!props.book) {
      return
    }
    const data = {
      cid: props.clipping.id,
      bid: props.book.id,
      uid: props.clipping.creator.id,
      theme: currentTheme
    }

    // setShareURL('https://avatars.githubusercontent.com/u/8704175?v=4')
    setShareURL(getUTPLink(UTPService.clipping, data))
    setLoading(true)
    setErrMsg('')
  }, [props.clipping.id, props.book?.id, currentTheme])

  const { t } = useTranslation()
  return (
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <section className='flex flex-col mt-2'>
        <div className='w-full'>
          <img
            src={shareURL}
            onLoad={onImageLoad}
            onError={onImageError}
            className={'h-[812px] w-[375px] rounded'}
            alt={t('app.common.loading')}
          />
          {/* {loading && (
            <span>{t('app.common.loading')}</span>
          )} */}
        </div>

        <footer className='w-full mt-4 flex flex-col'>
          <ThemePicker
            current={currentTheme}
            onChange={(t) => {
              setCurrentTheme(t)
            }}
          />
          <a
            href={shareURL}
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-${props.clipping.id}.png`}
            className='text-white text-lg w-full from-indigo-400 to-teal-600 bg-gradient-to-br block text-center py-4 mt-4 rounded shadow hover:scale-105 duration-150'
            target='_blank'
            rel="noreferrer"
          >
            {t('app.clipping.save')}
          </a>
        </footer>
      </section>
    </Dialog>
  )
}

export default Preview
