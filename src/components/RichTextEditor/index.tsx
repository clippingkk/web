import { type ForwardedRef, forwardRef } from 'react'
import TiptapEditor, { type TiptapEditorRef } from './TiptapEditor'

// define your extension array
type CKBaseEditorProps = {
  editable?: boolean
  withMindMap?: boolean
  style?: React.CSSProperties
  className?: string
  // Table of Content
  markdown?: string
  onContentChange?: (content: string) => void
  ref?: ForwardedRef<LegacyEditorRef>
}

// Legacy interface for compatibility with existing Lexical usage
interface LegacyEditorRef {
  update: (callback: () => void) => void
}

function CKBaseEditor(props: CKBaseEditorProps) {
  const {
    className,
    editable,
    markdown,
    onContentChange,
    style,
    ref: editor,
  } = props

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

export default CKBaseEditor
