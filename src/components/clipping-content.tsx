import { Quote } from 'lucide-react'
import React, { useMemo } from 'react'

type ClippingContentProps = {
  content: string
  className?: string
  showQuoteIcon?: boolean
  maxLines?: number
}

function ClippingContent({
  content,
  className = '',
  showQuoteIcon = false,
  maxLines = 0,
}: ClippingContentProps) {
  const lines: string[] = useMemo(() => {
    // Remove bracket numbers
    const local = content.replace(/\[\d*\]/, '')
    // Split by bullet points
    const raws = local.split('•').filter((line) => line.trim().length > 0)
    // If maxLines is set, limit the number of lines
    return maxLines > 0 ? raws.slice(0, maxLines) : raws
  }, [content, maxLines])

  if (lines.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {showQuoteIcon && (
        <div className="absolute -left-4 -top-3 opacity-15 text-gray-500 dark:text-gray-300">
          <Quote size={32} />
        </div>
      )}
      <div className={`relative ${lines.length > 1 ? 'space-y-2' : ''}`}>
        {lines.map((line, i) => (
          <p
            key={i}
            className={`leading-relaxed ${className} ${i === 0 ? 'first-letter:text-6xl first-letter:font-bold' : ''}`}
          >
            {line.trim()}
          </p>
        ))}
      </div>
    </div>
  )
}

export default ClippingContent
