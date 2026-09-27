import type React from 'react'

const LINK = /^([\s\S]*)<link>([\s\S]*)<\/link>([\s\S]*)$/

/**
 * Renders a translated sentence that marks one span as `<link>…</link>`, so
 * each language places the link where its grammar wants it. Without the
 * markup the text renders as is.
 */
export function withLink(
  text: string,
  renderLink: (label: string) => React.ReactNode
): React.ReactNode {
  const match = LINK.exec(text)
  if (!match) return text
  const [, before, label, after] = match
  return (
    <>
      {before}
      {renderLink(label)}
      {after}
    </>
  )
}
