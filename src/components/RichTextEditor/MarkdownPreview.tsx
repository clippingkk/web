import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import type { LexicalEditor } from 'lexical'
import { useEffect, useRef } from 'react'
import CKLexicalBaseEditor from './index'

type MarkdownPreviewProps = {
  md: string
}

function MarkdownPreview(props: MarkdownPreviewProps) {
  const { md } = props
  const editor = useRef<LexicalEditor>(null)
  useEffect(() => {
    editor.current?.update(() => {
      $convertFromMarkdownString(md, TRANSFORMERS)
    })
  }, [md])
  return (
    <CKLexicalBaseEditor
      editable={false}
      className="w-full px-2 focus:shadow-sm focus:bg-slate-300 focus:outline-hidden rounded-sm transition-all duration-150"
      markdown={md}
      ref={editor}
    />
  )
}

export default MarkdownPreview
