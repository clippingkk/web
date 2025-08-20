import Modal from '@annatarhe/lake-ui/modal'
import { useMutation } from '@tanstack/react-query'
import FileSaver from 'file-saver'
import { toBlob } from 'html-to-image'
import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/i18n/client'
import { KonzertThemeMap } from '@/services/utp'
import type { WenquBook } from '@/services/wenqu'
import type { Clipping, User } from '../../schema/generated'
import Button from '../button/button'
import Preview4Clipping from './preview4-clipping'
import ThemePicker from './theme-picker'

type PreviewProps = {
  visible: boolean
  onCancel: () => void
  onOk: () => void
  background: string
  // clipping: Omit<Clipping, 'aiSummary' | 'reactions' | 'source' | 'comments'>
  clipping: Pick<Clipping, 'id' | 'title' | 'content' | 'createdAt'> & {
    creator: Pick<User, 'id' | 'name' | 'avatar'>
  }
  book: WenquBook | null
}

function Preview(props: PreviewProps) {
  const [currentTheme, setCurrentTheme] = useState(KonzertThemeMap.light.id)

  const { t } = useTranslation()

  const previewDOM = useRef(null)
  const { isPending, mutate: onSave } = useMutation({
    mutationFn: async () => {
      if (!previewDOM.current) {
        return
      }
      const blob = await toBlob(previewDOM.current, {
        pixelRatio: 3,
        skipAutoScale: false,
        canvasWidth: 375,
        width: 375,
        cacheBust: true,
      })
      if (!blob) {
        throw new Error('no blob')
      }
      const filename = `clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-${props.clipping.id}.png`
      return FileSaver.saveAs(blob, filename)
    },
    onSuccess: () => {
      toast.success(t('app.clipping.preview.success'))
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      console.log(err)
      toast.error(err.toString())
    },
  })

  return (
    <Modal
      onClose={props.onCancel}
      isOpen={props.visible}
      title={t('app.clipping.preview')}
    >
      <section className="mt-2 flex p-4">
        <Preview4Clipping
          clipping={props.clipping}
          book={props.book}
          theme={currentTheme}
          ref={previewDOM}
        />
        <aside className="mt-2 ml-4 flex flex-col">
          <div className="w-96 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <blockquote
              className="font-lxgw border-l-4 border-teal-500 py-2 pl-4 text-gray-700 italic dark:text-gray-200"
              cite={props.book?.author}
            >
              {props.clipping.content}
            </blockquote>
          </div>
          <hr className="my-10 border-t border-gray-200 dark:border-gray-700" />

          <div className="w-full">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Theme
            </h3>
            <ThemePicker
              className="w-full"
              current={currentTheme}
              onChange={(t) => {
                setCurrentTheme(t)
              }}
            />
          </div>
          <div className="w-full flex-1" />
          <Button
            onClick={() => onSave()}
            isLoading={isPending}
            variant="secondary"
            className="from-teal-500/80 to-teal-600/80 after:from-teal-500/40 after:to-teal-500/40 hover:shadow-teal-500/20"
          >
            {t('app.clipping.save')}
          </Button>
        </aside>
      </section>
    </Modal>
  )
}

export default Preview
