import React, { useCallback, useMemo, useRef, useState } from 'react'
import { FetchClippingQuery } from '../../schema/generated'
import { HoverCard, Modal, Highlight } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import NounEditContent from '../noun/noun-edit'
import { offset, useFloating, arrow, FloatingArrow } from '@floating-ui/react'
import NounTooltipCard from './noun-tooltip-card'
import { useClickOutside } from '@mantine/hooks'

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
    isGrandAdmin = false
  } = props
  const { t } = useTranslation()

  const nouns = useMemo(() => {
    const m = new Map<string, FetchClippingQuery['clipping']['richContent']['nouns'][0]>()
    richContent?.nouns.forEach(n => {
      m.set(n.noun, n)
    })
    return m
  }, [richContent?.nouns])

  const [editingNoun, setEditingNoun] = useState<{ id: number, noun: string } | undefined>(undefined)

  const onNounAdd = useCallback((noun: string) => {
    setEditingNoun({ id: -1, noun })
  }, [])

  const onNounUpdate = useCallback((id: number, noun: string) => {
    setEditingNoun({ id, noun })
  }, [])

  const [selectingText, setSelectingText] = useState<string | undefined>()

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

    const box = selection.getRangeAt(0).getBoundingClientRect()
    refs.setPositionReference({
      getBoundingClientRect() {
        return box
      }
    })
    setSelectingText(selection.toString())
  }, [])

  const coRef = useClickOutside(() => {
    setSelectingText(undefined)
  })

  return (
    <>
      <div className={className} ref={coRef} >
        <Highlight
          inherit
          onMouseUp={onClippingSelect}
          highlight={[]}
          highlightStyles={{
            background: 'transparent',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
          }}
        >
          {richContent?.plain ?? ''}
        </Highlight>
        {selectingText && (
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
            }}
            className={`z-50 p-4 rounded-xl relative with-fade-in bg-gradient-to-b from-slate-50 to-slate-200 isolate`}
          >
            <FloatingArrow
              ref={arrowRef}
              context={context}
              tipRadius={2}
              fill='#f8fafc'
            />
            <NounTooltipCard
              noun={nouns.get(selectingText)}
              segment={selectingText}
              creatable={isPremium}
              updatable={isPremium}
              deletable={isGrandAdmin && isPremium}
              onNounAdd={onNounAdd} onNounUpdate={onNounUpdate}
            />
          </div>
        )}
      </div>
      <Modal
        opened={!!editingNoun}
        centered
        zIndex={300}
        overlayProps={{
          color: 'black',
          opacity: 0.55,
          blur: 50,
        }}
        size={'xl'}
        transitionProps={{ transition: 'fade', duration: 150 }}
        onClose={() => setEditingNoun(undefined)}
        title={editingNoun?.id === -1 ? t('app.nouns.title.add') : t('app.nouns.title.update')}
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
