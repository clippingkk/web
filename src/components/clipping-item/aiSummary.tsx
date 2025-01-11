import { Blockquote, LoadingOverlay, Modal, Paper, Tooltip } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import client from '../../services/pp'
import { CKPromptDescribeBookPassageVariables, CKPrompts } from '../../types.g'
import { WenquBook } from '../../services/wenqu'
import { getLanguage } from '../../utils/locales'
import { useQuery } from '@tanstack/react-query'

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

  const isMobile = useViewportSize().width <= 768

  const { t } = useTranslation()

  const errMsg = useMemo(() => {
    return error?.message
  }, [error])

  return (
    <Modal
      opened={open}
      onClose={onClose}
      centered
      size='auto'
      title={t('app.clipping.aiSummary')}
      overlayProps={{
        blur: 10,
        opacity: 0.7
      }}
    >
      <div className='relative'>
        <LoadingOverlay
          visible={isLoading}
        />
        <Tooltip
          label={errMsg?.includes('403') ? t('app.payment.required') : t('app.ai.clippingHelp')}
          withArrow
          transitionProps={{ duration: 175, transition: 'pop' }}
        >
          <Paper className='w-96 md:w-144 lg:w-[600px]'>
            <Blockquote
              icon={isMobile ? null : undefined}
              cite=' - ChatGPT'
              className='font-lxgw text-xl'
            >
              {errMsg ?? data.join('')}
            </Blockquote>
          </Paper>
        </Tooltip>
      </div>
    </Modal>
  )
}

export default ClippingAISummaryModal
