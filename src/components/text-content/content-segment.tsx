import React, { useCallback } from 'react'
import { FetchClippingQuery, Noun } from '../../schema/generated'
import { Button, ButtonGroup, HoverCard, Popover } from '@mantine/core'
import { useTranslation } from 'react-i18next'

type ContentSegmentProps = {
  noun?: FetchClippingQuery['clipping']['richContent']['nouns'][0]
  segment: string
  creatable?: boolean
  updatable?: boolean
  deletable?: boolean
  onNounAdd: (noun: string) => void
  onNounUpdate: (id: number, noun: string) => void
}

const symbolList = new Set([
  "、", "，", "。", "！", "@", "——", "【", "】",
])

function ContentSegment(props: ContentSegmentProps) {
  const {
    noun,
    segment,
    creatable,
    updatable,
    deletable,
    onNounAdd,
    onNounUpdate,
  } = props
  const { t } = useTranslation()

  if (symbolList.has(segment)) {
    return <span>{segment}</span>
  }

  if (creatable && !noun) {
    return (
      <Popover
        withArrow
        transitionProps={{ transition: 'pop', duration: 125 }}
        width={300}
      >
        <Popover.Target>
          <span>{segment}</span>
        </Popover.Target>
        <Popover.Dropdown>
          <p className='w-full text-center text-xl'>{segment}</p>
          <p>{t('app.nouns.empty.tip')}</p>
          <div className='mt-4 flex justify-end'>
            <Button onClick={() => onNounAdd(segment)}>{t('app.nouns.empty.add')}</Button>
          </div>
        </Popover.Dropdown>
      </Popover>
    )
  }

  return (
    <HoverCard withArrow transitionProps={{ transition: 'pop', duration: 125 }}>
      <HoverCard.Target>
        <span>{segment}</span>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <p>{segment}</p>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}

export default ContentSegment
