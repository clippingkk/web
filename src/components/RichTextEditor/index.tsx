import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HashtagNode } from '@lexical/hashtag'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
// import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import type { EditorState, LexicalEditor } from 'lexical'
import { type ForwardedRef, forwardRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'
import { LexicalTheme } from './theme'

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

function CKLexicalBaseEditor(
  props: LexicalEditorProps,
  editor: ForwardedRef<LexicalEditor>
) {
  const { className, editable, markdown, onContentChange, style } = props

  const onChange = useCallback(
    (es: EditorState) => {
      es.read(() => {
        const md = $convertToMarkdownString(TRANSFORMERS)
        onContentChange?.(md)
      })
    },
    [onContentChange]
  )

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
          HashtagNode,
          // AIPenDiffParagraphNode,
          // AIPenParagraphNode,
          // {
          //   replace: ParagraphNode,
          //   with: (node: ParagraphNode) => new AIPenParagraphNode(),
          // },
        ],
        theme: LexicalTheme,
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
            <div className="absolute top-7 left-5 text-gray-400 dark:text-zinc-500 pointer-events-none select-none">
              Enter some text...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        {/* <AutoFocusPlugin /> */}
        <OnChangePlugin onChange={onChange} />
        <TablePlugin />
        <LinkPlugin />
        <CheckListPlugin />
        <HashtagPlugin />
        <CodeHighlightPlugin />
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
