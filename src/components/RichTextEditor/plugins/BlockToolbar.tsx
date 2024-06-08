import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { NodeEventPlugin } from '@lexical/react/LexicalNodeEventPlugin'
import { useMutation } from '@tanstack/react-query'
import {
  $getNearestNodeFromDOMNode,
  LexicalNode,
  ParagraphNode,
  RootNode,
} from 'lexical'
import { useCallback, useState } from 'react'
import BlockToolbarView from '../BlockToolbarView'
// import BlockToolbarView from '../BlockToolBarView'
// import BlockToolbarView from '../../components/editor/block-toolbar'
// import {
//   $createAIPenParagraphNode,
//   $isAIPenParagraphNode,
// } from '../nodes/ParagraphNode'

function BlockToolBar() {
  const [editor] = useLexicalComposerContext()

  const [activeNode, setActiveNode] = useState<LexicalNode | null>(null)

  const [offsetY, setOffsetY] = useState(-1)

  const { mutate: doImproveParagraph } = useMutation({
    mutationFn: (args: any) => {
      return Promise.resolve(1)
      // return improveParagraph(args)
    },
    onMutate: () => {
      // if (!activeNode || !$isAIPenParagraphNode(activeNode)) {
      //   return
      // }
      // editor.update(
      //   () => {
      //     activeNode.toLoading()
      //   },
      //   {
      //     tag: 'skip-scroll-into-view',
      //   },
      // )
    },
    onSuccess: (data) => {
      // if (!activeNode || !$isAIPenParagraphNode(activeNode)) {
      //   return
      // }
      // editor.update(
      //   () => {
      //     activeNode.toLoaded()
      //     const n = $createAIPenParagraphNode()
      //     $convertFromMarkdownString(data.result, TRANSFORMERS, n)
      //     activeNode.replace(n)
      //   },
      //   { tag: 'skip-scroll-into-view' },
      // )
    },
    onError: (error) => {
      // if (!activeNode || !$isAIPenParagraphNode(activeNode)) {
      //   return
      // }
      // console.log('show error', error)
      // editor.update(
      //   () => {
      //     activeNode.toLoaded()
      //   },
      //   { tag: 'skip-scroll-into-view' },
      // )
    },
  })

  const onMouseEnter = useCallback((event: Event) => {
    const target = event.target as Element
    if (!target) {
      return
    }
    const relatedTarget = target.parentElement
    const node = $getNearestNodeFromDOMNode(target)
    if (!node) {
      return
    }
    setActiveNode(node)
    setOffsetY(
      target.getBoundingClientRect().y -
      (relatedTarget?.getBoundingClientRect().y ?? 0),
    )
  }, [])

  const onMouseLeave = useCallback(() => {
    console.log('on mouse leave')
    // editor
    setActiveNode(null)
    setOffsetY(-1)
  }, [])

  const onLLMImprove = useCallback(
    (prompt?: string) => {
      if (!activeNode) {
        return
      }

      editor.getEditorState().read(() => {
        // const n = $getNodeByKey(activeNode.getKey())
        const pv = activeNode.getPreviousSibling()?.getTextContent()
        const ct = activeNode.getTextContent()
        const nt = activeNode.getNextSibling()?.getTextContent()
        doImproveParagraph({
          previous: pv,
          current: ct,
          next: nt,
          prompt,
        })
      })
    },
    [activeNode],
  )

  return (
    <>
      <NodeEventPlugin
        nodeType={ParagraphNode}
        eventType="mouseenter"
        eventListener={onMouseEnter}
      />
      <NodeEventPlugin
        nodeType={RootNode}
        eventType="mouseleave"
        eventListener={onMouseLeave}
      />
      <BlockToolbarView offsetY={offsetY} onLLMImprove={onLLMImprove} />
      {/* <BlockToolbarView offsetY={456} onLLMImprove={onLLMImprove} /> */}
    </>
  )
}

export default BlockToolBar
