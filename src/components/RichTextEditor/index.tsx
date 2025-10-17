import { type ForwardedRef, forwardRef } from 'react'
import TiptapEditor, { type TiptapEditorRef } from './TiptapEditor'

// define your extension array
type LexicalEditorProps = {
  editable?: boolean
  withMindMap?: boolean
  style?: React.CSSProperties
  className?: string
  // Table of Content
  markdown?: string
  onContentChange?: (content: string) => void
}

// Legacy interface for compatibility with existing Lexical usage
interface LegacyEditorRef {
  update: (callback: () => void) => void
}

function CKLexicalBaseEditor(
  props: LexicalEditorProps,
  editor: ForwardedRef<LegacyEditorRef>
) {
  const { className, editable, markdown, onContentChange, style } = props

  return (
    <div className='flex w-full relative'>
      <TiptapEditor
        ref={editor as ForwardedRef<TiptapEditorRef>}
        className={className}
        style={style}
        editable={editable}
        markdown={markdown}
        onContentChange={onContentChange}
      />
    </div>
  )
}

export default forwardRef(CKLexicalBaseEditor)
