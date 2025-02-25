import React, { useMemo, useState } from 'react'
import { useTranslation } from '@/i18n/client'
import client from '../../services/pp'
import { CKPromptDescribeBookPassageVariables, CKPrompts } from '../../types.g'
import { WenquBook } from '../../services/wenqu'
import { getLanguage } from '../../utils/locales'
import { useQuery } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { Loader2 } from 'lucide-react'
import Modal from '@annatarhe/lake-ui/modal'
import { MarkdownComponents } from '../RichTextEditor/markdown-components'

type ClippingAISummaryModalProps = {
  uid?: number
  cid?: number
  book?: WenquBook | null
  clippingContent: string
  open: boolean
  onClose: () => void
}

export type serverGraphQLError = {
  name: string, result: {
    errors: {
      message: string,
      path: string[],
      extensions: {
        code: number,
        message: string
      }
    }[]
  }
}

function ClippingAISummaryModal(props: ClippingAISummaryModalProps) {
  const { cid, open, book, clippingContent, uid, onClose } = props
  const [data, setData] = useState<string[]>([])

  const { isLoading, error } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['book', book?.id, cid, 'aiSummary'],
    queryFn: async () => {
      return client.executeStream<CKPrompts, CKPromptDescribeBookPassageVariables>(
        CKPrompts.DescribeBookPassage,
        {
          lang: getLanguage(),
          bookTitle: book!.title,
          author: book!.author,
          pbDate: book!.pubdate,
          url: book!.url,
          isbn: book!.isbn,
          summary: book!.summary,
          passage: clippingContent
        },
        uid ? uid.toString() : undefined,
        {
          onData: (chunk) => {
            setData(d => [...d, chunk.message])
            return Promise.resolve()
          },
          onEnd: () => {
            return Promise.resolve()
          }
        }).then((final) => {
          setData([final.message])
          return final
        })
    },
    enabled: open && !!cid && !!book,
  })

  const { t } = useTranslation()

  const errMsg = useMemo(() => {
    return error?.message
  }, [error])

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t('app.clipping.aiSummary')}
    >
      <div className='relative min-h-[200px] max-h-[calc(90vh-8rem)] overflow-y-auto overflow-x-hidden p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 dark:[&::-webkit-scrollbar-track]:bg-gray-800/20 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50'>
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-xs'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-600 dark:text-gray-300' />
          </div>
        )}
        {errMsg ? (
          <div className='rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800/50 dark:bg-red-900/20'>
            <p className='font-lxgw text-lg text-red-800 dark:text-red-200'>{errMsg}</p>
            <p className='mt-2 text-sm text-red-600 dark:text-red-400'>- ChatGPT</p>
          </div>
        ) : (
          <div>
            <Markdown components={MarkdownComponents}>{data.join('')}</Markdown>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ClippingAISummaryModal
