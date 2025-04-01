import React, { useMemo, useState } from 'react'
import LakeModal from '@annatarhe/lake-ui/modal'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp'
import ThemePicker from './theme-picker'

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
    <LakeModal
      onClose={props.onCancel}
      isOpen={opened}
      title={t('app.clipping.preview')}
    >
      <section className='flex flex-col md:flex-row gap-6 mt-4 p-2 overflow-y-auto' style={{ maxHeight: '80vh' }}>
        <div className='relative flex-shrink-0 mx-auto md:mx-0'>
          <img
            src={shareURL}
            className={'w-[375px] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 object-cover'}
            alt={t('app.common.loading') ?? 'loading'}
          />
        </div>

        <aside className='mt-2 flex flex-col flex-1 mb-2'>
          <div className='w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
            <blockquote className='font-lxgw text-lg italic text-gray-700 dark:text-gray-300 border-l-4 border-indigo-500 pl-4 py-2'>
              <div className='max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
                {props.book?.summary}
              </div>
              {props.book?.author && (
                <footer className='text-sm text-gray-500 dark:text-gray-400 mt-2'>— {props.book.author}</footer>
              )}
            </blockquote>
          </div>

          <div className='w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent my-8' />

          <div className='w-full'>
            <h6 className='text-sm font-semibold uppercase tracking-wider mb-4 text-gray-700 dark:text-gray-300'>Theme</h6>
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
            className='text-white text-lg w-full bg-gradient-to-br from-indigo-500 to-teal-500 block text-center py-4 mt-6 rounded-md shadow-md hover:shadow-xl hover:from-indigo-600 hover:to-teal-600 transition-all duration-300 font-medium'
            target='_blank'
            rel="noreferrer"
          >
            {t('app.clipping.save')}
          </a>
        </aside>
      </section>
    </LakeModal>
  )
}

export default BookSharePreview
