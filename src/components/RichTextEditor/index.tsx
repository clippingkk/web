import { ForwardedRef, forwardRef, useCallback } from 'react'

import { EditorState, LexicalEditor } from 'lexical'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import toast from 'react-hot-toast'

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

function CKLexicalBaseEditor(props: LexicalEditorProps, editor: ForwardedRef<LexicalEditor>) {
  const {
    className,
    editable,
    markdown,
    onContentChange,
    style
  } = props

  const onChange = useCallback((es: EditorState) => {
    es.read(() => {
      const md = $convertToMarkdownString(TRANSFORMERS)
      onContentChange?.(md)
    })
  }, [onContentChange])

  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'CKEditor',
        onError(error) {
          toast.error(error.message)
        },
        editable,
        nodes: [
          MarkNode,
          HeadingNode,
          QuoteNode,
          LinkNode,
          ListNode,
          ListItemNode,
          CodeHighlightNode,
          CodeNode,
          TableNode,
          TableRowNode,
          TableCellNode,
          // AIPenDiffParagraphNode,
          // AIPenParagraphNode,
          // {
          //   replace: ParagraphNode,
          //   with: (node: ParagraphNode) => new AIPenParagraphNode(),
          // },
        ],
        theme: {
          text: {
            underline: 'underline decoration-2 underline-offset-2',
            bold: 'font-semibold',
            italic: 'italic',
            strikethrough: 'line-through opacity-70',
            code: 'px-1.5 py-0.5 mx-0.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md font-mono text-sm text-blue-600 dark:text-blue-400',
          },
          link: 'text-blue-400 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 decoration-1 cursor-pointer transition-colors duration-200',
          quote: 'my-4 pl-4 py-2 border-l-4 border-blue-400 bg-gray-50 dark:bg-zinc-800/50 rounded-r-lg italic text-gray-700 dark:text-zinc-300',
          list: {
            ol: 'list-decimal list-inside ml-2 space-y-1',
            ul: 'list-disc list-inside ml-2 space-y-1',
            listitem: 'my-1 text-gray-700 dark:text-zinc-300',
          },
          table: 'my-4 w-full border-collapse overflow-hidden rounded-lg shadow-sm',
          tableCell: 'px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800',
          tableRow: 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors duration-200',
          code: 'p-3 my-4 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg font-mono text-sm overflow-x-auto',
          codeHighlight: {
            background: 'bg-gray-100 dark:bg-zinc-800',
          },
          paragraph:
            'my-3 leading-relaxed text-gray-700 dark:text-zinc-300',
          heading: {
            h1: 'text-3xl font-bold my-6 text-gray-900 dark:text-zinc-50',
            h2: 'text-2xl font-bold my-5 text-gray-900 dark:text-zinc-50',
            h3: 'text-xl font-semibold my-4 text-gray-900 dark:text-zinc-50',
            h4: 'text-lg font-semibold my-3 text-gray-900 dark:text-zinc-50',
            h5: 'text-base font-semibold my-2 text-gray-900 dark:text-zinc-50',
            h6: 'text-sm font-semibold my-2 text-gray-900 dark:text-zinc-50',
          },
        },
        editorState: () =>
          $convertFromMarkdownString(markdown ?? '', TRANSFORMERS),
      }}
    >
      <div className="flex w-full relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className={className} style={style} />
          }
          placeholder={
            <div className='absolute top-7 left-5 text-gray-400 dark:text-zinc-500 pointer-events-none select-none'>
              Enter some text...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={onChange} />
        <TablePlugin />
        <LinkPlugin />
        <ClickableLinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        {editor && (
          <EditorRefPlugin
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            editorRef={editor as any}
          />
        )}
        {/* <LexicalBlockPlugin /> */}
        {/* <BlockToolBar /> */}
        {/* <FloatingMenuPlugin
            element={anchorElem.current}
            MenuComponent={FloatingToolBar}
          /> */}
        {/* <EditorToolbarPlugin anchor={anchorElem.current} /> */}
      </div>
    </LexicalComposer>
  )
}

export default forwardRef(CKLexicalBaseEditor)
