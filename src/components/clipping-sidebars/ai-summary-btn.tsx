'use client'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import ClippingAISummaryModal from '@/components/clipping-item/aiSummary'
import { useTranslation } from '@/i18n/client'
import type { Clipping, User } from '@/schema/generated'
import type { WenquBook } from '@/services/wenqu'
import {
  SidebarButton,
  SidebarContainer,
  SidebarIcon,
  SidebarText,
} from './base/container'

type Props = {
  clipping?: Pick<Clipping, 'id' | 'content' | 'title'> & {
    creator: Pick<User, 'id'>
  }
  me?: Pick<User, 'id'>
  book?: WenquBook | null
}

function AISummaryBtn({ clipping, me, book }: Props) {
  const { t } = useTranslation()
  const [aiSummaryVisible, setAISummaryVisible] = useState(false)

  return (
    <>
      <SidebarContainer>
        <SidebarButton onClick={() => setAISummaryVisible(true)}>
          <SidebarIcon className="text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300">
            <Sparkles className="w-full h-full" />
          </SidebarIcon>
          <SidebarText>{t('app.clipping.aiSummary')}</SidebarText>
        </SidebarButton>
      </SidebarContainer>
      <ClippingAISummaryModal
        uid={me?.id}
        cid={clipping?.id}
        book={book}
        clippingContent={clipping?.content || ''}
        open={aiSummaryVisible}
        onClose={() => setAISummaryVisible(false)}
      />
    </>
  )
}

export default AISummaryBtn
