import Modal from '@annatarhe/lake-ui/modal'
import { Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/i18n/client'
import { useAiEnhanceCommentMutation } from '@/schema/generated'
import MarkdownPreview from '../markdown-editor/md-preview'

type AICommentEnhancerProps = {
  bookName?: string
  clippingId: number
  comment: string
  onAccept: (nt: string) => void
}

enum Prompts {
  Professional = 1,
  Deeper = 2,
  Intriguing = 3,
}

function AICommentEnhancer(props: AICommentEnhancerProps) {
  const [opened, setOpened] = useState(false)
  const { t } = useTranslation()
  const [doEnhance, { loading, data }] = useAiEnhanceCommentMutation({
    variables: {
      promptId: -1,
      bookName: props.bookName,
      clippingId: props.clippingId,
      content: props.comment,
    },
    onCompleted() {
      toast.success('Got an AI improved comment!')
      setOpened(true)
    },
  })

  const onEnhance = useCallback(
    (promptId: Prompts) => {
      return doEnhance({
        variables: {
          promptId: promptId,
          bookName: props.bookName,
          clippingId: props.clippingId,
          content: props.comment,
        },
      })
    },
    [doEnhance, props.bookName, props.clippingId, props.comment]
  )

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          className="flex items-center justify-center rounded bg-gradient-to-r from-gray-500 to-pink-400 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => onEnhance(Prompts.Professional)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('app.ai.professionalize')}
        </button>
        <button
          type="button"
          disabled={loading}
          className="flex items-center justify-center rounded bg-gradient-to-r from-pink-400 to-green-500 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => onEnhance(Prompts.Deeper)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('app.ai.deeplize')}
        </button>
        <button
          type="button"
          disabled={loading}
          className="flex items-center justify-center rounded bg-gradient-to-r from-green-500 to-sky-400 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => onEnhance(Prompts.Intriguing)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Make it more intriguing
        </button>
      </div>
      <Modal
        isOpen={opened || loading}
        onClose={() => setOpened(false)}
        title="Enhanced Comment"
      >
        <MarkdownPreview
          value={data?.aiEnhanceComment.content ?? '## Loading'}
        />
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={() => setOpened(false)}
            className="mr-4 rounded bg-gray-300 px-4 py-2 font-medium text-black transition-colors hover:bg-gray-400"
          >
            {t('app.common.cancel')}
          </button>
          <button
            type="button"
            className="rounded bg-gradient-to-br from-green-300 to-pink-400 px-4 py-2 font-medium text-black transition-opacity hover:opacity-90"
            onClick={() => {
              setOpened(false)
              props.onAccept(data?.aiEnhanceComment.content ?? '')
            }}
          >
            {t('app.common.accept')}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default AICommentEnhancer
