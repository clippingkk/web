import React, { useRef, useState } from 'react'
import Dialog from '../dialog/dialog'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import FileSaver from 'file-saver'
import { toast } from 'react-hot-toast'
import { KonzertThemeMap } from '../../services/utp'
import ThemePicker from './theme-picker'
import { Blockquote, Button, Divider, Paper, Title } from '@mantine/core'
import { Clipping, User } from '../../schema/generated'
import Preview4Clipping from './preview4-clipping'
import { toBlob } from 'html-to-image'
import { useMutation } from '@tanstack/react-query'

type PreviewProps = {
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
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <section className='flex mt-2'>
        <Preview4Clipping
          clipping={props.clipping}
          book={props.book}
          theme={currentTheme}
          ref={previewDOM}
        />
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
          <div className='flex-1 w-full' />
          <Button
            onClick={() => onSave()}
            loading={isPending}
            variant='filled'
            className='bg-teal-400'
            color='teal'
          >
            {t('app.clipping.save')}
          </Button>
        </aside>
      </section>
    </Dialog>
  )
}

export default Preview
