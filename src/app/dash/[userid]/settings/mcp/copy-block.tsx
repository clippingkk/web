'use client'

import IconButton from '@annatarhe/lake-ui/icon-button'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'

type CopyBlockProps = {
  value: string
  label?: string
}

/** Monospaced text a reader copies into another tool, with a copy button. */
function CopyBlock({ value, label }: CopyBlockProps) {
  const { t } = useTranslation(undefined, 'settings')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error(t('mcp.copyFailed'))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label ? <span className="type-meta">{label}</span> : null}
      <div className="bg-lake-surface-muted border-lake-line rounded-lake-control flex items-start gap-2 border py-2 pr-1.5 pl-3">
        <code className="text-lake-fg min-w-0 flex-1 overflow-x-auto py-1 font-mono text-sm whitespace-pre">
          {value}
        </code>
        <IconButton
          variant="ghost"
          size="sm"
          label={copied ? t('mcp.copied') : t('mcp.copy')}
          icon={
            copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )
          }
          onClick={copy}
        />
      </div>
    </div>
  )
}

export default CopyBlock
