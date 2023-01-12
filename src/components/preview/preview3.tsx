import React, { useCallback, useEffect, useState } from 'react'
import Dialog from '../dialog/dialog'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp'
import ThemePicker from './theme-picker'
import { Blockquote, Divider, Paper, Text, Title } from '@mantine/core'
import { Clipping, User } from '../../schema/generated'

type PreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: Pick<Clipping, 'id' | 'content'> & { creator: Pick<User, 'id'> }
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
      <section className='flex mt-2'>
        <div>
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

        <aside className='mt-2 flex flex-col ml-4'>
          <Paper className='w-128'>
            <Blockquote cite={props.book?.author} className='font-lxgw'>
              {props.clipping.content}
            </Blockquote>
          </Paper>

          <Divider className='my-10' />

          <div className='w-full'>
            <Title order={6} className='mb-4'>Theme</Title>
            <ThemePicker
              className='w-full'
              current={currentTheme}
              onChange={(t) => {
                setCurrentTheme(t)
              }}
            />
          </div>
          <a
            href={shareURL}
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-${props.clipping.id}.png`}
            className='text-white text-lg w-full from-indigo-400 to-teal-600 bg-gradient-to-br block text-center py-4 mt-4 rounded shadow hover:shadow-2xl duration-150'
            target='_blank'
            rel="noreferrer"
          >
            {t('app.clipping.save')}
          </a>
        </aside>
      </section>
    </Dialog>
  )
}

export default Preview
