import React, { useMemo, useState } from 'react'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp'
import ThemePicker from './theme-picker'
import { Blockquote, Divider, Modal, Paper, Text, Title } from '@mantine/core'

type BookSharePreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  book: WenquBook | null
  uid: number | null
  opened: boolean
}

function BookSharePreview(props: BookSharePreviewProps) {
  const { opened } = props
  const [currentTheme, setCurrentTheme] = useState(KonzertThemeMap.young.id)

  const shareURL = useMemo(() => {
    if (!props.uid) {
      return
    }
    return getUTPLink(
      UTPService.book,
      {
        uid: props.uid,
        bid: props.book?.id,
        theme: currentTheme
      })
  }, [props.uid, props.book, currentTheme])

  // useEffect(() => {
  //   if (!props.book) {
  //     return
  //   }
  //   // setShareURL('https://avatars.githubusercontent.com/u/8704175?v=4')
  //   setShareURL(getUTPLink(UTPService.book, data))
  //   setLoading(true)
  //   setErrMsg('')
  // }, [props.clipping.id, props.book?.id, currentTheme])

  const { t } = useTranslation()
  return (
    <Modal
      onClose={props.onCancel}
      opened={opened}
      centered
      size='xl'
      overlayProps={{
        blur: 8,
        opacity: 0.7
      }}
      style={{
        '--modal-size': 'fit-content',
      }}
      styles={{
        content: {
          // background: 'linear-gradient(45deg, rgba(0,212,255,0.35), rgba(111, 111, 111, 0.35))'
        }
      }}
      title={t('app.clipping.preview')}
    >
      <section className='flex mt-2'>
        <div>
          <img
            src={shareURL}
            className={'w-[375px] rounded-sm overflow-y-auto'}
            alt={t('app.common.loading') ?? 'loading'}
          />
          {/* {loading && (
            <span>{t('app.common.loading')}</span>
          )} */}
        </div>

        <aside className='mt-2 flex flex-col ml-4'>
          <Paper className='w-128'>
            <Blockquote cite={props.book?.author} className='font-lxgw'>
              <Text className=' max-h-[500px] overflow-y-scroll'>
                {props.book?.summary}
              </Text>
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
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-share.png`}
            className='text-white text-lg w-full from-indigo-400 to-teal-600 bg-linear-to-br block text-center py-4 mt-4 rounded-sm shadow-sm hover:shadow-2xl duration-150'
            target='_blank'
            rel="noreferrer"
          >
            {t('app.clipping.save')}
          </a>
        </aside>
      </section>
    </Modal>
  )
}

export default BookSharePreview
