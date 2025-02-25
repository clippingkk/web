import React, { useCallback, useMemo, useState } from 'react'
import Dialog from '../dialog/dialog'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp'
import ThemePicker from './theme-picker'
import { Blockquote, Divider, Paper, Title } from '@mantine/core'
import { Clipping, User } from '../../schema/generated'
import LoadingIcon from '../icons/loading.svg'

type PreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: Pick<Clipping, 'id' | 'content'> & { creator: Pick<User, 'id'> }
  book: WenquBook | null
}

function Preview(props: PreviewProps) {
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

  const shareURL = useMemo(() => {
    if (!props.book) {
      return ''
    }
    const data = {
      cid: props.clipping.id,
      bid: props.book.id,
      uid: props.clipping.creator.id,
      theme: currentTheme
    }
    return getUTPLink(UTPService.clipping, data)
  }, [props.clipping.id, props.book?.id, currentTheme])

  const { t } = useTranslation()
  return (
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <section className='flex mt-2'>
        <div className='relative'>
          <img
            src={shareURL}
            onLoad={onImageLoad}
            onLoadStart={() => setLoading(true)}
            onError={onImageError}
            className={'h-[812px] w-[375px] rounded-sm'}
            alt={t('app.common.loading') ?? 'loading'}
          />
          {loading && (
            <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center bg-slate-800 bg-opacity-80'>
              <LoadingIcon className='w-8 h-8 animate-spin' />
              <span className='ml-2 dark:text-white'>{t('app.common.loading')}</span>
            </div>
          )}
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
            className='text-white text-lg w-full from-indigo-400 to-teal-600 bg-linear-to-br block text-center py-4 mt-4 rounded-sm shadow-sm hover:shadow-2xl duration-150'
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
