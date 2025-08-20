'use client'
import { BookCopy } from 'lucide-react'
import { useState } from 'react'
import BookInfoChanger from '@/components/book-info-changer/bookInfoChanger'
import { useTranslation } from '@/i18n/client'
import type { Clipping, User } from '@/schema/generated'
import {
  SidebarButton,
  SidebarContainer,
  SidebarIcon,
  SidebarText,
} from './base/container'

type Props = {
  clipping?: Pick<Clipping, 'id' | 'title'> & { creator: Pick<User, 'id'> }
  me?: Pick<User, 'id'>
}

function UpdateClippingBtn({ clipping, me }: Props) {
  const { t } = useTranslation()
  const [updateClippingBookId, setUpdateClippingBookId] = useState(-1)

  if (clipping?.creator.id !== me?.id) {
    return null
  }

  return (
    <SidebarContainer>
      <SidebarButton
        onClick={() => {
          if (!clipping) {
            return
          }
          setUpdateClippingBookId(clipping.id)
        }}
      >
        <SidebarIcon>
          <BookCopy className="h-full w-full" />
        </SidebarIcon>
        <SidebarText>{t('app.clipping.update')}</SidebarText>
      </SidebarButton>
      <BookInfoChanger
        bookName={clipping?.title}
        clippingID={clipping?.id ?? -1}
        visible={updateClippingBookId >= 0}
        onClose={() => {
          setUpdateClippingBookId(-1)
        }}
        onConfirm={() => {
          setUpdateClippingBookId(-1)
          return Promise.resolve()
        }}
      />
    </SidebarContainer>
  )
}

export default UpdateClippingBtn
