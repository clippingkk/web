'use client'
import type { ClippingData } from '@annatarhe/clippingkk-widget'
import { Code2 } from 'lucide-react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
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
  clipping?: Pick<
    Clipping,
    'id' | 'content' | 'title' | 'createdAt' | 'pageAt'
  > & {
    creator: Pick<User, 'id' | 'name' | 'avatar'>
  }
  book: WenquBook | null
}

function CopyEmbedHTMLBtn({ clipping, book }: Props) {
  const { t } = useTranslation(undefined, 'clipping-detail')
  const onCopyEmbedHtml = useCallback(() => {
    if (!clipping) {
      toast.error(
        t(
          'app.clipping.embed.dataUnavailable',
          'Clipping data is not available.'
        )
      )
      return
    }

    const dataToEmbed: Partial<ClippingData> = {
      id: clipping.id.toString(),
      content: clipping.content,
      book: book?.title ?? clipping.title,
      author: book?.author ?? '',
      location: clipping.pageAt,
      createdAt: clipping.createdAt,
      creator: {
        id: clipping.creator.id.toString(),
        name: clipping.creator.name,
        avatar: clipping.creator.avatar,
      },
    }

    const template = `
<clippingkk-web-widget
  clippingid="${clipping.id}"
  theme="light"
  clippingdata='${JSON.stringify(dataToEmbed)}'>
</clippingkk-web-widget>
`
    navigator.clipboard
      .writeText(template)
      .then(() => {
        toast.success(
          t('app.clipping.embed.copied', 'Copied! Paste it into your website.')
        )
      })
      .catch((err) => {
        console.error('Failed to copy embed HTML:', err)
        toast.error(t('app.clipping.embed.copyFailed', 'Failed to copy.'))
      })
  }, [clipping, book, t])

  return (
    <SidebarContainer>
      <SidebarButton onClick={onCopyEmbedHtml} disabled={!clipping}>
        <SidebarIcon>
          <Code2 className="h-full w-full" />
        </SidebarIcon>
        <SidebarText>{t('app.clipping.embed.title')}</SidebarText>
      </SidebarButton>
    </SidebarContainer>
  )
}

export default CopyEmbedHTMLBtn
