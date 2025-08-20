'use client'
import { BookCopy } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import type { Clipping, User } from '@/schema/generated'
import type { WenquBook } from '@/services/wenqu'
import Preview from '../preview/preview3'
import {
  SidebarButton,
  SidebarContainer,
  SidebarIcon,
  SidebarText,
} from './base/container'

type Props = {
  book?: WenquBook | null
  clipping?: Pick<Clipping, 'id' | 'title' | 'content' | 'createdAt'> & {
    creator: Pick<User, 'id' | 'name' | 'avatar'>
  }
}

function UpdateClippingBtn({ clipping, book }: Props) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  if (!clipping || !book) {
    return null
  }

  return (
    <SidebarContainer>
      <SidebarButton onClick={() => setVisible(!visible)}>
        <SidebarIcon>
          <BookCopy className="w-full h-full" />
        </SidebarIcon>
        <SidebarText>{t('app.clipping.shares')}</SidebarText>
      </SidebarButton>
      <Preview
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => setVisible(false)}
        background={book.image}
        clipping={clipping}
        book={book}
      />
    </SidebarContainer>
  )
}

export default UpdateClippingBtn
