'use client'
import { useTranslation } from '@/i18n/client'
import { Clipping, User } from '@/schema/generated'
import { BookCopy } from 'lucide-react'
import { useState } from 'react'
import { SidebarContainer, SidebarButton, SidebarIcon, SidebarText } from './base/container'
import BookInfoChanger from '@/components/book-info-changer/bookInfoChanger'

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
      <SidebarButton onClick={() => {
        if (!clipping) {
          return
        }
        setUpdateClippingBookId(clipping.id)
      }}>
        <SidebarIcon>
          <BookCopy className="w-full h-full" />
        </SidebarIcon>
        <SidebarText>
          {t('app.clipping.update')}
        </SidebarText>
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
          return Promise.resolve(1)
        }}
      />
    </SidebarContainer>
  )
}

export default UpdateClippingBtn
