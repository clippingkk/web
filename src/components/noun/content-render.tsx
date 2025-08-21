import dayjs from 'dayjs'
import { useTranslation } from '@/i18n/client'
import type { FetchClippingQuery } from '../../schema/generated'
import Avatar from '../avatar/avatar'
import Button from '../button/button'
import MarkdownPreview from '../markdown-editor/md-preview'

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
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-xl'>{noun?.noun}</h3>
        {updatable && (
          <Button
            size='sm'
            variant='secondary'
            onClick={() => onUpdate(noun.id, noun.noun)}
          >
            {t('app.nouns.form.update')}
          </Button>
        )}
      </div>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {noun?.updaters.map((u) => (
            <Avatar key={u.id} className='h-12 w-12' isPremium img={u.avatar} />
          ))}
          <div className='flex flex-col'>
            {noun?.updaters.map((u) => (
              <span className='text-sm font-bold' key={u.id}>
                {u.name}
              </span>
            ))}
            <span className='text-xs text-gray-500'>
              {t('app.clipping.noun.card.whoUpdatedTips')}
            </span>
          </div>
        </div>
        <time className='text-xs text-gray-500'>
          {dayjs(noun?.updatedAt).format('YYYY-MM-DD HH:mm')}
        </time>
      </div>
      <hr className='mb-4' />
      <p className='w-96 lg:w-128'>
        <MarkdownPreview value={noun?.content ?? ''} />
      </p>
    </>
  )
}

export default NounContentRender
