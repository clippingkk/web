'use client'

import Button from '@annatarhe/lake-ui/button'
import { Copy, RefreshCw, Square } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'

type AIResultActionsProps = {
  isLoading: boolean
  onStop: () => void
  onRewrite: () => void
  /** Built on click, since it is only needed when the reader copies. */
  copyText: () => string
}

/** Stop while the model writes. Copy or rewrite once it has finished. */
function AIResultActions(props: AIResultActionsProps) {
  const { isLoading, onStop, onRewrite, copyText } = props
  const { t } = useTranslation(undefined, 'ai')

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<Square className="size-3.5" />}
        onClick={onStop}
      >
        {t('actions.stop')}
      </Button>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText())
      toast.success(t('actions.copied'))
    } catch {
      toast.error(t('actions.copyFailed'))
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<Copy className="size-3.5" />}
        onClick={copy}
      >
        {t('actions.copy')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<RefreshCw className="size-3.5" />}
        onClick={onRewrite}
      >
        {t('actions.rewrite')}
      </Button>
    </div>
  )
}

export default AIResultActions
