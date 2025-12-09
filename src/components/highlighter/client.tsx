'use client'
// import { useLayoutEffect, useState } from 'react'
import type { BundledLanguage } from 'shiki/bundle/web'
// import { highlight } from './shared'

interface Props {
  code: string
  lang: BundledLanguage
}

function CodeBlock({ code, lang }: Props): React.ReactNode {
  return (
    <pre className="rounded-md bg-gray-900 p-4 overflow-x-auto">
      <code className={`language-${lang} text-sm text-white`}>
        {code}
      </code>
    </pre>
  )
  // const [nodes, setNodes] = useState<React.ReactNode | null>(null)

  // useLayoutEffect(() => {
  //   void highlight(code, lang).then(setNodes)
  // }, [code, lang])

  // console.log('nnnnnn', nodes)

  // if (!nodes) {
  //   return <p>Loading...</p>
  // }

  // return nodes
}

export default CodeBlock
