import React, { useRef, useState } from 'react'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import FileSaver from 'file-saver'
import { toast } from 'react-hot-toast'
import { KonzertThemeMap } from '../../services/utp'
import ThemePicker from './theme-picker'
import { Blockquote, Divider, Paper, Title } from '@mantine/core'
import Button from '../button'
import { Clipping, User } from '../../schema/generated'
import Preview4Clipping from './preview4-clipping'
import { toBlob } from 'html-to-image'
import { useMutation } from '@tanstack/react-query'
import Modal from '@annatarhe/lake-ui/modal'

type PreviewProps = {
  visible: boolean
  onCancel: () => void
  onOk: () => void
  background: string
  // clipping: Omit<Clipping, 'aiSummary' | 'reactions' | 'source' | 'comments'>
  clipping: Pick<Clipping, 'id' | 'title' | 'content' | 'createdAt'> & { creator: Pick<User, 'id' | 'name' | 'avatar'> }
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
        cacheBust: true
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
    }
  })

  return (
    <Modal
      onClose={props.onCancel}
      isOpen={props.visible}
      title={t('app.clipping.preview')}
    >
      <section className='flex mt-2 p-4'>
        <Preview4Clipping
          clipping={props.clipping}
          book={props.book}
          theme={currentTheme}
          ref={previewDOM}
        />
        <aside className='mt-2 flex flex-col ml-4'>
          <Paper className='w-96'>
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
          <div className='flex-1 w-full' />
          <Button
            onClick={() => onSave()}
            isLoading={isPending}
            variant='secondary'
            className='from-teal-500/80 to-teal-600/80 after:from-teal-500/40 after:to-teal-500/40 hover:shadow-teal-500/20'
          >
            {t('app.clipping.save')}
          </Button>
        </aside>
      </section>
    </Modal>
  )
}

export default Preview
