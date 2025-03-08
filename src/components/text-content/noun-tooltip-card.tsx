import React from 'react'
import { FetchClippingQuery } from '../../schema/generated'
import { useTranslation } from 'react-i18next'
import { Button } from '@mantine/core'
import NounContentRender from '../noun/content-render'

type NounTooltipCardProps = {
  noun?: FetchClippingQuery['clipping']['richContent']['nouns'][0]
  segment: string
  creatable?: boolean
  updatable?: boolean
  deletable?: boolean
  onNounAdd: (noun: string) => void
  onNounUpdate: (id: number, noun: string) => void
}

function NounTooltipCard(props: NounTooltipCardProps) {
  const { noun, segment, creatable, updatable, onNounAdd, onNounUpdate } = props
  const { t } = useTranslation()
  if (creatable && !noun) {
    return (
      <>
        <p className='w-full text-center text-xl'>{segment}</p>
        <p className='text-gray-500 text-sm'>{t('app.nouns.empty.tip')}</p>
        <div className='mt-4 flex justify-end'>
          <Button onClick={() => onNounAdd(segment)}>{t('app.nouns.empty.add')}</Button>
        </div>
      </>
    )
  }

  // 不能创建，而且也没有内容，暂时不知道咋操作，先不做
  if (!noun) {
    return <span className='text-gray-500 text-lg'>{segment}</span>
  }

  return (
    <NounContentRender
      noun={noun}
      updatable={updatable}
      onUpdate={onNounUpdate} />
  )
}

export default NounTooltipCard
