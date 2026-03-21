import LakeModal from '@annatarhe/lake-ui/modal'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import type { WenquBook } from '@/services/wenqu'

import type { Clipping, User } from '../../schema/generated'
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
      <section className="mt-4 flex flex-col gap-2 p-2 md:flex-row">
        <div className="relative mx-auto flex-shrink-0 md:mx-0">
          <img
            src={shareURL}
            onLoad={onImageLoad}
            onLoadStart={() => setLoading(true)}
            onError={onImageError}
            className={
              'h-[812px] w-[375px] rounded-lg border border-gray-200 object-cover shadow-xl dark:border-gray-700'
            }
            alt={t('app.common.loading') ?? 'loading'}
          />
          {loading && (
            <div className="bg-opacity-80 absolute inset-0 flex items-center justify-center rounded-lg bg-slate-800 backdrop-blur-sm">
              <LoadingIcon className="h-10 w-10 animate-spin text-indigo-400" />
              <span className="ml-3 font-medium text-white">
                {t('app.common.loading')}
              </span>
            </div>
          )}
        </div>

        <aside className="mt-2 flex flex-1 flex-col">
          <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-slate-800">
            <blockquote className="font-lxgw border-l-4 border-indigo-500 py-2 pl-4 text-lg text-gray-700 italic dark:text-gray-300">
              <p>{props.clipping.content}</p>
              {props.book?.author && (
                <footer className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  — {props.book.author}
                </footer>
              )}
            </blockquote>
          </div>

          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />

          <div className="w-full">
            <h6 className="mb-4 text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Theme
            </h6>
            <ThemePicker
              className="w-full"
              current={currentTheme}
              onChange={(t) => {
                setCurrentTheme(t)
              }}
            />
          </div>
          <a
            href={shareURL}
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-${props.clipping.id}.png`}
            className="mt-6 block w-full rounded-md bg-gradient-to-br from-indigo-500 to-teal-500 py-4 text-center text-lg font-medium text-white shadow-md transition-all duration-300 hover:from-indigo-600 hover:to-teal-600 hover:shadow-xl"
            target="_blank"
            rel="noreferrer"
          >
            {t('app.clipping.save')}
          </a>
        </aside>
      </section>
    </LakeModal>
  )
}

export default Preview
