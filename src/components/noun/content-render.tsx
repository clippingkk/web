import React from 'react'
import MarkdownPreview from '../markdown-editor/md-preview'
import { Button } from '@mantine/core'
import { FetchClippingQuery } from '../../schema/generated'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Avatar from '../avatar/avatar'

type NounContentRenderProps = {
  updatable?: boolean
  noun: FetchClippingQuery['clipping']['richContent']['nouns'][0]
  onUpdate: (id: number, noun: string) => void
}

function NounContentRender(props: NounContentRenderProps) {
  const { noun, onUpdate, updatable } = props
  const { t } = useTranslation()

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-xl'>{noun?.noun}</h3>
        {updatable && (
          <Button
            size='xs'
            onClick={() => onUpdate(noun.id, noun.noun)}
          >{t('app.nouns.form.update')}</Button>
        )}
      </div>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2'>
          {noun?.updaters.map(u => (
            <Avatar key={u.id} className='w-12 h-12' isPremium img={u.avatar} />
          ))}
          <div className='flex flex-col'>
            {noun?.updaters.map(u => (
              <span className='text-sm font-bold' key={u.id}>{u.name}</span>
            ))}
            <span className='text-gray-500 text-xs'>{t('app.clipping.noun.card.whoUpdatedTips')}</span>
          </div>
        </div>
        <time className='text-gray-500 text-xs'>
          {dayjs(noun?.updatedAt).format('YYYY-MM-DD HH:mm')}
        </time>
      </div>
      <hr className='mb-4' />
      <p className=' w-96 lg:w-128'>
        <MarkdownPreview value={noun?.content ?? ''} />
      </p>
    </>
  )
}

export default NounContentRender
