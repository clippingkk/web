import LakeModal from '@annatarhe/lake-ui/modal'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import type { Clipping, User } from '@/gql/graphql'
import type { WenquBook } from '@/services/wenqu'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp'
import LoadingIcon from '../icons/loading.svg'
import ThemePicker from './theme-picker'

type PreviewProps = {
  visible: boolean
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: Pick<Clipping, 'id' | 'content'> & { creator: Pick<User, 'id'> }
  book: WenquBook | null
}

function Preview(props: PreviewProps) {
  const { visible, onCancel } = props
  const [loading, setLoading] = useState(true)
  const [currentTheme, setCurrentTheme] = useState(KonzertThemeMap.young.id)

  const onImageLoad = useCallback(() => {
    setLoading(false)
  }, [])
  const onImageError = useCallback(() => {
    toast.error('Image loading failed')
    setLoading(false)
  }, [])

  const shareURL = useMemo(() => {
    if (!props.book) {
      return ''
    }
    const data = {
      cid: props.clipping.id,
      bid: props.book.id,
      uid: props.clipping.creator.id,
      theme: currentTheme,
    }
    return getUTPLink(UTPService.clipping, data)
  }, [
    props.clipping.id,
    props.book?.id,
    currentTheme,
    props.book,
    props.clipping.creator.id,
  ])

  const { t } = useTranslation()
  return (
    <LakeModal
      onClose={onCancel}
      isOpen={visible}
      title={t('app.clipping.preview')}
    >
      <section className='flex flex-col md:flex-row gap-2 mt-4 p-2'>
        <div className='relative flex-shrink-0 mx-auto md:mx-0'>
          <img
            src={shareURL}
            onLoad={onImageLoad}
            onLoadStart={() => setLoading(true)}
            onError={onImageError}
            className={
              'h-[812px] w-[375px] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 object-cover'
            }
            alt={t('app.common.loading') ?? 'loading'}
          />
          {loading && (
            <div className='absolute inset-0 flex justify-center items-center bg-slate-800 bg-opacity-80 backdrop-blur-sm rounded-lg'>
              <LoadingIcon className='w-10 h-10 animate-spin text-indigo-400' />
              <span className='ml-3 text-white font-medium'>
                {t('app.common.loading')}
              </span>
            </div>
          )}
        </div>

        <aside className='mt-2 flex flex-col flex-1'>
          <div className='w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
            <blockquote className='font-lxgw text-lg italic text-gray-700 dark:text-gray-300 border-l-4 border-indigo-500 pl-4 py-2'>
              <p>{props.clipping.content}</p>
              {props.book?.author && (
                <footer className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                  — {props.book.author}
                </footer>
              )}
            </blockquote>
          </div>

          <div className='w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent my-8' />

          <div className='w-full'>
            <h6 className='text-sm font-semibold uppercase tracking-wider mb-4 text-gray-700 dark:text-gray-300'>
              Theme
            </h6>
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
            className='text-white text-lg w-full bg-gradient-to-br from-indigo-500 to-teal-500 block text-center py-4 mt-6 rounded-md shadow-md hover:shadow-xl hover:from-indigo-600 hover:to-teal-600 transition-all duration-300 font-medium'
            target='_blank'
            rel='noreferrer'
          >
            {t('app.clipping.save')}
          </a>
        </aside>
      </section>
    </LakeModal>
  )
}

export default Preview
