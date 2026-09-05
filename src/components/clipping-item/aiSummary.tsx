import Modal from '@annatarhe/lake-ui/modal'

import { useAIGeneration } from '@/hooks/use-ai-generation'
// import { Streamdown } from 'streamdown'
import { useTranslation } from '@/i18n/client'

import type { WenquBook } from '../../services/wenqu'
import { getLanguage } from '../../utils/locales'
import { PulseLoader } from '../book-recommendation/pulse-loader'

type ClippingAISummaryModalProps = {
  uid?: number
  cid?: number
  book?: WenquBook | null
  clippingContent: string
  open: boolean
  onClose: () => void
}

export type serverGraphQLError = {
  name: string
  result: {
    errors: {
      message: string
      path: string[]
      extensions: {
        code: number
        message: string
      }
    }[]
  }
}

function ClippingAISummaryModal(props: ClippingAISummaryModalProps) {
  const { cid, open, book, onClose } = props
  const { text, isLoading, error } = useAIGeneration(
    'passage',
    {
      clippingId: cid,
      language: getLanguage(),
      book: {
        title: book?.title ?? '',
        author: book?.author ?? '',
        summary: book?.summary ?? '',
        pubdate: book?.pubdate ?? '',
        url: book?.url ?? '',
        isbn: book?.isbn ?? '',
      },
    },
    open && !!cid && !!book
  )
  const { t } = useTranslation()
  const errMsg = error?.message

  return (
    <Modal isOpen={open} onClose={onClose} title={t('app.clipping.aiSummary')}>
      <div className="relative max-h-[calc(90vh-8rem)] min-h-[200px] overflow-x-hidden overflow-y-auto p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50 [&::-webkit-scrollbar-track]:bg-gray-100/20 dark:[&::-webkit-scrollbar-track]:bg-gray-800/20">
        {isLoading && <PulseLoader />}
        {errMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
            <p className="font-lxgw text-lg text-red-800 dark:text-red-200">
              {errMsg}
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              - ChatGPT
            </p>
          </div>
        ) : (
          <div>
            {/* <Streamdown components={MarkdownComponents}> */}
            {text}
            {/* </Streamdown> */}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ClippingAISummaryModal
