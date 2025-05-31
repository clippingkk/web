import AISummaryBtn from '@/components/clipping-sidebars/ai-summary-btn'
import CopyEmbedHTMLBtn from '@/components/clipping-sidebars/copy-embed-html-btn'
import DoubanLinkBtn from '@/components/clipping-sidebars/douban-link.btn'
import ClippingShareButton from '@/components/clipping-sidebars/share-clipping-btn'
import SiblingNav from '@/components/clipping-sidebars/sibling-nav'
import UpdateClippingBtn from '@/components/clipping-sidebars/update-clipping-btn'
import VisibleToggle from '@/components/clipping-sidebars/visible-toggle'
import { Clipping, User } from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'
import { WenquBook } from '@/services/wenqu'

type ClippingSidebarProps = {
  clipping?: Pick<
    Clipping,
    | 'id'
    | 'visible'
    | 'content'
    | 'title'
    | 'createdAt'
    | 'nextClipping'
    | 'prevClipping'
    | 'pageAt'
  > & { creator: Pick<User, 'id' | 'name' | 'domain' | 'avatar'> }
  book: WenquBook | null
  me?: Pick<User, 'id' | 'name' | 'domain' | 'avatar'>
  inAppChannel: IN_APP_CHANNEL
}

function ClippingSidebar(props: ClippingSidebarProps) {
  const { clipping, me, inAppChannel, book } = props

  const clippingDomain = clipping
    ? clipping.creator.domain.length > 2
      ? clipping.creator.domain
      : clipping.creator.id.toString()
    : me?.id.toString()

  return (
    <div className="bg-opacity-50 dark:bg-opacity-50 my-4 flex-1 rounded-sm bg-slate-200 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-800">
      <div className="flex h-full w-full flex-col items-center justify-between">
        <ul className="w-full list-none p-0">
          <AISummaryBtn clipping={clipping} me={me} book={book} />
          <ClippingShareButton book={book} clipping={clipping} />
          <DoubanLinkBtn book={book} />
          <CopyEmbedHTMLBtn clipping={clipping} book={book} />
          <VisibleToggle clipping={clipping} me={me} />
          <UpdateClippingBtn clipping={clipping} me={me} />
        </ul>
        <ul className="w-full list-none p-0">
          <SiblingNav
            clipping={clipping}
            iac={inAppChannel}
            domain={clippingDomain}
          />
        </ul>
      </div>
    </div>
  )
}

export default ClippingSidebar
