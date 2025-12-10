'use client'
import { useLayoutEffect, useState } from 'react'
import type { BundledLanguage } from 'shiki/bundle/web'
import { highlight } from './shared'

interface Props {
  code: string
  lang: BundledLanguage
}

function CodeBlock({ code, lang }: Props): React.ReactNode {
  const [nodes, setNodes] = useState<React.ReactNode | null>(null)

  useLayoutEffect(() => {
    void highlight(code, lang).then(setNodes)
  }, [code, lang])

  if (!nodes) {
    return <p>Loading...</p>
  }

  return nodes
}

export default CodeBlock
