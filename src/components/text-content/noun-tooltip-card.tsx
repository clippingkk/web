import { useTranslation } from '@/i18n/client'
import type { FetchClippingQuery } from '@/schema/generated'
import Button from '../button/button'
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
        <p className="w-full text-center text-xl">{segment}</p>
        <p className="text-sm text-gray-500">{t('app.nouns.empty.tip')}</p>
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNounAdd(segment)}
          >
            {t('app.nouns.empty.add')}
          </Button>
        </div>
      </>
    )
  }

  // 不能创建，而且也没有内容，暂时不知道咋操作，先不做
  if (!noun) {
    return <span className="text-lg text-gray-500">{segment}</span>
  }

  return (
    <NounContentRender
      noun={noun}
      updatable={updatable}
      onUpdate={onNounUpdate}
    />
  )
}

export default NounTooltipCard
