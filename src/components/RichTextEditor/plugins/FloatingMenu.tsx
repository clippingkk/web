import { computePosition } from '@floating-ui/dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL as NORMAL_PRIORITY,
  SELECTION_CHANGE_COMMAND as ON_SELECTION_CHANGE,
} from 'lexical'
// fork from: https://github.com/konstantinmuenster/lexical-floating-menu/blob/main/src/FloatingMenuPlugin.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { usePointerInteractions } from '../hooks/usePointerInteractions'

const DEFAULT_DOM_ELEMENT = document.body

type FloatingMenuCoords = { x: number; y: number } | undefined

export type FloatingMenuComponentProps = {
  editor: ReturnType<typeof useLexicalComposerContext>[0]
  shouldShow: boolean
}

export type FloatingMenuPluginProps = {
  element?: HTMLElement | null
  MenuComponent: React.FC<FloatingMenuComponentProps>
}

function FloatingMenuPlugin({
  element,
  MenuComponent,
}: FloatingMenuPluginProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<FloatingMenuCoords>(undefined)
  const show = coords !== undefined

  const [editor] = useLexicalComposerContext()
  const { isPointerDown, isPointerReleased } = usePointerInteractions()

  const calculatePosition = useCallback(() => {
    const domSelection = getSelection()
    const domRange =
      domSelection?.rangeCount !== 0 && domSelection?.getRangeAt(0)

    if (!domRange || !ref.current || isPointerDown) return setCoords(undefined)

    computePosition(domRange, ref.current, { placement: 'top' })
      .then((pos) => {
        setCoords({ x: pos.x, y: pos.y - 8 })
      })
      .catch(() => {
        setCoords(undefined)
      })
  }, [isPointerDown])

  const $handleSelectionChange = useCallback(() => {
    if (editor.isComposing()) return false

    if (editor.getRootElement() !== document.activeElement) {
      setCoords(undefined)
      return true
    }

    const selection = $getSelection()

    if ($isRangeSelection(selection) && !selection.anchor.is(selection.focus)) {
      calculatePosition()
    } else {
      setCoords(undefined)
    }

    return true
  }, [editor, calculatePosition])

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      ON_SELECTION_CHANGE,
      $handleSelectionChange,
      NORMAL_PRIORITY,
    )
    return unregisterCommand
  }, [editor, $handleSelectionChange])

  useEffect(() => {
    if (!show && isPointerReleased) {
      editor.getEditorState().read(() => {
        $handleSelectionChange()
      })
    }
    // Adding show to the dependency array causes an issue if
    // a range selection is dismissed by navigating via arrow keys.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPointerReleased, $handleSelectionChange, editor])

  if (!MenuComponent) return null

  return createPortal(
    <div
      ref={ref}
      aria-hidden={!show}
      className="absolute z-50 duration-100 transition-all top-0 left-0"
      style={{
        transform: `translate(${coords?.x}px, ${coords?.y}px)`,
        // top: coords?.y,
        // left: coords?.x,
        visibility: show ? 'visible' : 'hidden',
        opacity: show ? 1 : 0,
        height: 40,
        width: 280,
      }}
    >
      <MenuComponent editor={editor} shouldShow={show} />
    </div>,
    element ?? DEFAULT_DOM_ELEMENT,
  )
}

export default FloatingMenuPlugin
