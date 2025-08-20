import LakeModal from '@annatarhe/lake-ui/modal'
import { useMemo, useState } from 'react'
import { useTranslation } from '@/i18n/client'
import { getUTPLink, KonzertThemeMap, UTPService } from '../../services/utp'
import type { WenquBook } from '../../services/wenqu'
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
    return getUTPLink(UTPService.book, {
      uid: props.uid,
      bid: props.book?.id,
      theme: currentTheme,
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
      <section
        className="mt-4 flex flex-col gap-6 overflow-y-auto p-2 md:flex-row"
        style={{ maxHeight: '80vh' }}
      >
        <div className="relative mx-auto flex-shrink-0 md:mx-0">
          <img
            src={shareURL}
            className={
              'w-[375px] rounded-lg border border-gray-200 object-cover shadow-xl dark:border-gray-700'
            }
            alt={t('app.common.loading') ?? 'loading'}
          />
        </div>

        <aside className="mt-2 mb-2 flex flex-1 flex-col">
          <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-slate-800">
            <blockquote className="font-lxgw border-l-4 border-indigo-500 py-2 pl-4 text-lg text-gray-700 italic dark:text-gray-300">
              <div className="custom-scrollbar max-h-[500px] overflow-y-auto pr-2">
                {props.book?.summary}
              </div>
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
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-share.png`}
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

export default BookSharePreview
