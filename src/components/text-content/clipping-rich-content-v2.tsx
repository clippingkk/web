import { useTranslation } from '@/i18n/client'
import Modal from '@annatarhe/lake-ui/modal'
import { arrow, FloatingArrow, offset, useFloating } from '@floating-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClickOutside } from '../../hooks/dom'
import { FetchClippingQuery } from '../../schema/generated'
import NounEditContent from '../noun/noun-edit'
import NounTooltipCard from './noun-tooltip-card'

type ClippingRichContentProps = {
  isPremium?: boolean
  isGrandAdmin?: boolean
  richContent?: FetchClippingQuery['clipping']['richContent']
  bookId?: string
  clippingId?: number
  className?: string
}

function ClippingRichContentV2(props: ClippingRichContentProps) {
  const {
    richContent,
    className,
    bookId,
    clippingId,
    isPremium = false,
    isGrandAdmin = false,
  } = props
  const { t } = useTranslation()

  const nouns = useMemo(() => {
    const m = new Map<
      string,
      FetchClippingQuery['clipping']['richContent']['nouns'][0]
    >()
    richContent?.nouns.forEach((n) => {
      m.set(n.noun, n)
    })
    return m
  }, [richContent?.nouns])

  const [selectingText, setSelectingText] = useState<string | undefined>()
  const [editingNoun, setEditingNoun] = useState<
    { id: number; noun: string } | undefined
  >(undefined)

  const onNounAdd = useCallback((noun: string) => {
    setSelectingText(undefined)
    setEditingNoun({ id: -1, noun })
  }, [])

  const onNounUpdate = useCallback((id: number, noun: string) => {
    setSelectingText(undefined)
    setEditingNoun({ id, noun })
  }, [])

  const arrowRef = useRef(null)

  const { refs, floatingStyles, context } = useFloating({
    open: !!selectingText,
    middleware: [offset(8), arrow({ element: arrowRef })],
  })

  const onClippingSelect = useCallback(() => {
    const selection = getSelection()
    if (selection?.type !== 'Range') {
      setSelectingText(undefined)
      return
    }

    const newText = selection.toString()

    if (newText === selectingText) {
      setSelectingText(undefined)
      return
    }

    const box = selection.getRangeAt(0).getBoundingClientRect()
    refs.setPositionReference({
      getBoundingClientRect() {
        return box
      },
    })
    setSelectingText(newText)
  }, [selectingText])

  const coRef = useClickOutside<HTMLDivElement>(() => {
    setSelectingText(undefined)
  })

  useEffect(() => {
    if (selectingText) {
      refs.floating.current?.showPopover()
    } else {
      refs.floating.current?.hidePopover()
    }
  }, [selectingText])

  return (
    <>
      <div className={className} ref={coRef}>
        <div onMouseUp={onClippingSelect}>{richContent?.plain ?? ''}</div>
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
          }}
          popover="manual"
          className={
            'with-fade-in relative isolate z-50 m-0 overflow-visible rounded-xl bg-linear-to-b from-slate-50 to-slate-200 p-4 shadow-lg dark:from-slate-900 dark:to-slate-950'
          }
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            tipRadius={2}
            className="fill-slate-50 dark:fill-slate-900"
          />
          <NounTooltipCard
            noun={nouns.get(selectingText ?? '')}
            segment={selectingText ?? ''}
            creatable={isPremium}
            updatable={isPremium}
            deletable={isGrandAdmin && isPremium}
            onNounAdd={onNounAdd}
            onNounUpdate={onNounUpdate}
          />
        </div>
      </div>
      <Modal
        isOpen={!!editingNoun}
        onClose={() => setEditingNoun(undefined)}
        title={
          editingNoun?.id === -1
            ? t('app.nouns.title.add')
            : t('app.nouns.title.update')
        }
      >
        {editingNoun ? (
          <NounEditContent
            id={editingNoun.id}
            noun={editingNoun.noun}
            bookId={bookId}
            clippingId={clippingId}
            onClose={() => setEditingNoun(undefined)}
          />
        ) : (
          <div>No Noun Selected</div>
        )}
      </Modal>
    </>
  )
}

export default ClippingRichContentV2
