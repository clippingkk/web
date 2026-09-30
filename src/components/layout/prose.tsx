import type React from 'react'

import { cn } from '@/lib/utils'

type ProseProps = {
  as?: 'div' | 'article' | 'section'
  /** For text in a language other than the page's, e.g. an English policy. */
  lang?: string
  className?: string
  children: React.ReactNode
}

/**
 * Long-form text (policies, help): a reading measure, serif headings and a
 * comfortable line height, styled from plain h2/h3/h4, p, ul, a and strong.
 */
function Prose({ as: Tag = 'div', lang, className, children }: ProseProps) {
  return (
    <Tag
      lang={lang}
      className={cn(
        'text-lake-fg-muted max-w-[68ch] text-base leading-[1.75]',
        '[&>:first-child]:mt-0',
        '[&_h2]:type-heading [&_h2]:text-lake-fg [&_h2]:mt-12 [&_h2]:mb-3',
        '[&_h3]:font-reading [&_h3]:text-lake-fg [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold',
        '[&_h4]:text-lake-fg [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-semibold',
        '[&_p]:my-4',
        '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5 [&_li]:pl-1 [&_li]:marker:text-lake-fg-subtle',
        '[&_strong]:text-lake-fg [&_strong]:font-semibold',
        '[&_a]:text-lake-accent-text [&_a]:decoration-lake-accent-text/40 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:decoration-current',
        className
      )}
    >
      {children}
    </Tag>
  )
}

export default Prose
