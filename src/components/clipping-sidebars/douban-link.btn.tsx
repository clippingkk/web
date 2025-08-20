import { ExternalLink } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { WenquBook } from '@/services/wenqu'
import { SidebarContainer, SidebarIcon, SidebarText } from './base/container'

type Props = {
  book: Pick<WenquBook, 'doubanId'> | null
}

async function DoubanLinkBtn(props: Props) {
  const { book } = props
  const { t } = await useTranslation()
  return (
    <SidebarContainer className={cn(!book && 'opacity-50')}>
      <a
        className="flex items-center gap-2 p-4 w-full"
        href={
          book
            ? `https://book.douban.com/subject/${book?.doubanId}`
            : 'javascript:void(0)'
        }
        target="_blank"
        rel="noreferrer"
      >
        <SidebarIcon className="text-teal-500 group-hover:text-teal-600">
          <ExternalLink className="w-full h-full" />
        </SidebarIcon>
        <SidebarText className="text-center">
          {t('app.clipping.link')}
        </SidebarText>
      </a>
    </SidebarContainer>
  )
}

export default DoubanLinkBtn
