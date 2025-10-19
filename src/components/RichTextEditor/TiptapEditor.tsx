'use client'

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Link } from '@tiptap/extension-link'
import { Markdown } from '@tiptap/markdown'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { Typography } from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react'

const lowlight = createLowlight(common)

type TiptapEditorProps = {
  editable?: boolean
  withMindMap?: boolean
  style?: React.CSSProperties
  className?: string
  markdown?: string
  onContentChange?: (content: string) => void
}

export interface TiptapEditorRef {
  update: (callback: () => void) => void
  clear: () => void
}

function TiptapEditor(
  props: TiptapEditorProps,
  ref: ForwardedRef<TiptapEditorRef>
) {
  const { className, editable = true, markdown, onContentChange, style } = props

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:text-blue-500 underline',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Typography,
      Placeholder.configure({
        placeholder: 'Enter some text...',
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
      Markdown.configure({
        indentation: {
          style: 'space',
          size: 2,
        },
        markedOptions: {
          breaks: false,
        },
      }),
    ],
    content: markdown || '',
    contentType: 'markdown',
    editable,
    onUpdate: ({ editor }) => {
      // Use Tiptap's built-in markdown serialization
      const markdownContent = editor.getMarkdown()
      onContentChange?.(markdownContent)
    },
  })

  // Update content when markdown prop changes
  useEffect(() => {
    if (editor && markdown !== undefined) {
      const currentMarkdown = editor.getMarkdown()
      if (markdown !== currentMarkdown) {
        // Use Tiptap's built-in markdown parsing
        editor.commands.setContent(markdown, { contentType: 'markdown' })
      }
    }
  }, [editor, markdown])

  // Expose editor methods through ref
  useImperativeHandle(
    ref,
    () => ({
      update: (callback: () => void) => {
        if (editor) {
          editor.commands.focus()
          callback()
        }
      },
      clear: () => {
        if (editor) {
          editor.commands.clearContent()
        }
      },
    }),
    [editor]
  )

  if (!editor) {
    return null
  }

  return (
    <div className='tiptap-editor'>
      <EditorContent editor={editor} className={className} style={style} />
    </div>
  )
}

export default forwardRef(TiptapEditor)
