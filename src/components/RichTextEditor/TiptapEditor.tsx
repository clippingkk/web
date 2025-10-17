'use client'

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Link } from '@tiptap/extension-link'
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
    ],
    content: markdown || '',
    editable,
    onUpdate: ({ editor }) => {
      // Convert content to markdown-like format
      const text = editor.getText()
      const html = editor.getHTML()

      // Simple conversion to markdown-like format
      // This is a basic implementation - you might want to use a proper HTML to Markdown converter
      const markdownContent = html
        .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
        .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
        .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
        .replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1')
        .replace(/<h5[^>]*>(.*?)<\/h5>/g, '##### $1')
        .replace(/<h6[^>]*>(.*?)<\/h6>/g, '###### $1')
        .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
        .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1')
        .replace(/<ul[^>]*>(.*?)<\/ul>/gs, (match, content) => {
          return content.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
        })
        .replace(/<ol[^>]*>(.*?)<\/ol>/gs, (match, content) => {
          let counter = 1
          return content.replace(
            /<li[^>]*>(.*?)<\/li>/g,
            () => `${counter++}. $1\n`
          )
        })
        .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim()

      onContentChange?.(markdownContent || text)
    },
  })

  // Update content when markdown prop changes
  useEffect(() => {
    if (editor && markdown !== undefined) {
      const currentContent = editor.getHTML()
      // Convert markdown to HTML for Tiptap
      // This is a basic implementation - you might want to use a proper markdown parser
      const htmlContent = markdown
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
        .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
        .replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')

      if (htmlContent && htmlContent !== currentContent) {
        editor.commands.setContent(`<p>${htmlContent}</p>`)
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
