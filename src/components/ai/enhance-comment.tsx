'use client'

import Button from '@annatarhe/lake-ui/button'
import Menu from '@annatarhe/lake-ui/menu'
import Modal from '@annatarhe/lake-ui/modal'
import Spinner from '@annatarhe/lake-ui/spinner'
import { useMutation } from '@apollo/client/react'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { AiEnhanceCommentDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

type AICommentEnhancerProps = {
  bookName?: string
  clippingId: number
  comment: string
  onAccept: (nextComment: string) => void
}

/** Server-side prompt ids for each rewrite style. */
const STYLES = [
  { key: 'professional', promptId: 1 },
  { key: 'deeper', promptId: 2 },
  { key: 'intriguing', promptId: 3 },
] as const

/** Premium: rewrite a draft comment in one of a few styles. */
function AICommentEnhancer(props: AICommentEnhancerProps) {
  const { bookName, clippingId, comment, onAccept } = props
  const { t } = useTranslation(undefined, 'reading')
  const [open, setOpen] = useState(false)
  const [enhance, { loading, data, reset }] = useMutation(
    AiEnhanceCommentDocument
  )
  const suggestion = data?.aiEnhanceComment.content ?? ''

  const run = async (promptId: number) => {
    // one rewrite at a time, so a quick second pick can't race the first
    if (loading) return
    setOpen(true)
    reset()
    try {
      await enhance({
        variables: { promptId, bookName, clippingId, content: comment },
      })
    } catch (error) {
      setOpen(false)
      toast.error(
        error instanceof Error ? error.message : t('ai.enhance.failed')
      )
    }
  }

  return (
    <>
      <Menu
        label={t('ai.enhance.label')}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            loading={loading}
            leadingIcon={<Sparkles className="size-4" />}
          >
            {t('ai.enhance.label')}
          </Button>
        }
        items={STYLES.map((style) => ({
          key: style.key,
          label: t(`ai.enhance.${style.key}`),
          onSelect: () => void run(style.promptId),
        }))}
      />
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('ai.enhance.title')}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('ai.enhance.keep')}
            </Button>
            <Button
              variant="primary"
              disabled={!suggestion}
              onClick={() => {
                onAccept(suggestion)
                setOpen(false)
              }}
            >
              {t('ai.enhance.use')}
            </Button>
          </div>
        }
      >
        <div aria-live="polite" className="min-h-32">
          {loading || !suggestion ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Spinner size="md" />
              <p className="type-meta">{t('ai.enhance.working')}</p>
            </div>
          ) : (
            <p className="text-lake-fg text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
              {suggestion}
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}

export default AICommentEnhancer
