import React, { useCallback, useMemo, useRef, useState } from 'react'
import { FetchClippingQuery, Noun } from '../../schema/generated'
import { useClickOutside } from '@mantine/hooks'
import { HoverCard, Modal } from '@mantine/core'
import ContentSegment from './content-segment'
import { useTranslation } from 'react-i18next'
import NounEditContent from '../noun/noun-edit'

type ClippingRichContentProps = {
  isPremium?: boolean
  isGrandAdmin?: boolean
  richContent?: FetchClippingQuery['clipping']['richContent']
  className?: string
}

function ClippingRichContent(props: ClippingRichContentProps) {
  const { richContent, className, isPremium = false, isGrandAdmin = false } = props
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

  return (
    <>
      <div className={className}>
        {richContent?.segments.map((s, i) => (
          <ContentSegment
            key={i}
            noun={nouns.get(s)}
            segment={s}
            creatable={isPremium}
            updatable={isPremium}
            deletable={isGrandAdmin && isPremium}
            onNounAdd={onNounAdd}
            onNounUpdate={onNounUpdate}
          />
        ))}
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
        transitionProps={{ transition: 'fade', duration: 150 }}
        onClose={() => setEditingNoun(undefined)}
        title={editingNoun?.id === -1 ? t('app.nouns.title.add') : t('app.nouns.title.update')}
      >
        {editingNoun ? (
          <NounEditContent
            id={editingNoun.id}
            noun={nouns.get(editingNoun.noun ?? '')}
            onClose={() => setEditingNoun(undefined)}
          />
        ) : (
          <div>No Noun Selected</div>
        )}
      </Modal>
    </>
  )
}

export default ClippingRichContent
