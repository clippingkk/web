'use client'
import { useTranslation } from '@/i18n/client'
import { useCallback } from 'react'
import { Clipping, User } from '@/schema/generated'
import { WenquBook } from '@/services/wenqu'
import toast from 'react-hot-toast'
import { Code2 } from 'lucide-react'
import { SidebarContainer, SidebarButton, SidebarIcon, SidebarText } from './base/container'

type Props = {
  clipping?: Pick<Clipping, 'id' | 'content' | 'title' | 'createdAt'> & { creator: Pick<User, 'id' | 'name'> }
  book: WenquBook | null
}

function CopyEmbedHTMLBtn({ clipping, book }: Props) {
  const { t } = useTranslation()
  const onCopyEmbedHtml = useCallback(() => {
    const template = `
    <blockquote class="ck-clipping-card" data-cid='${clipping?.id}'>
  <p lang="zh" dir="ltr" class="ck-content">
  ${clipping?.content}
  </p>
  <p class="ck-author">
    —— 《${book?.title ?? clipping?.title}》 <small>${book?.author ?? ''}</small>
  </p>
  <p class="ck-info">
    <span>${clipping?.creator.name}</span> 摘录于 <time>${clipping?.createdAt}</time>
  </p>
</blockquote>
<script async src="https://web-widget-script.pages.dev/bundle.js" charset="utf-8"></script>
`
    navigator.clipboard.writeText(template).then(() => {
      toast.success('copied. just paste to your website')
    })
  }, [clipping, book])

  return (
    <SidebarContainer>
      <SidebarButton onClick={onCopyEmbedHtml}>
        <SidebarIcon>
          <Code2 className="w-full h-full" />
        </SidebarIcon>
        <SidebarText>
          {t('app.clipping.embed.title')}
        </SidebarText>
      </SidebarButton>
    </SidebarContainer>
  )
}

export default CopyEmbedHTMLBtn
