import { ForwardedRef, forwardRef, useCallback, useRef } from 'react'

import { EditorState, LexicalEditor } from 'lexical'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
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
            underline: 'underline',
            bold: 'font-bold',
            strikethrough: 'line-through',
            code: 'px-1 py border-1 border-gray-300 bg-gray-200 rounded text-slate-800',
          },
          link: 'text-blue-500 hover:text-blue-600 hover:underline cursor-pointer',
          quote: 'my-4 border-l-4 border-gray-300 pl-4 italic',
          list: {
            ol: 'list-decimal ml-4',
            ul: 'list-disc ml-4',
            listitem: 'my-2',
          },
          table: 'my-4 table-auto',
          tableCell: 'py-1 px-2 border border-gray-300',
          tableRow: 'border-b border-gray-300',
          code: 'p-1 bg-gray-200 rounded',
          codeHighlight: {
            background: 'bg-gray-200',
          },
          paragraph:
            'my-4 duration-100 transition-all',
          heading: {
            h1: 'text-4xl font-bold my-4',
            h2: 'text-3xl font-bold my-3',
            h3: 'text-2xl font-bold my-2',
            h4: 'text-xl font-bold my-1',
            h5: 'text-lg font-bold my',
            h6: 'text-base font-bold',
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
          placeholder={<div className='left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2'>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={onChange} />
        <TablePlugin />
        <LinkPlugin />
        <LexicalClickableLinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        {editor && (
          <EditorRefPlugin
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
