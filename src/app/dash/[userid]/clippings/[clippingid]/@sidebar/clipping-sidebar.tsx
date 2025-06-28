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
    <>
      {/* Actions Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-4">
          Actions
        </h3>
        <div className="space-y-2">
          <AISummaryBtn clipping={clipping} me={me} book={book} />
          <ClippingShareButton book={book} clipping={clipping} />
          <DoubanLinkBtn book={book} />
          <CopyEmbedHTMLBtn clipping={clipping} book={book} />
          <VisibleToggle clipping={clipping} me={me} />
          <UpdateClippingBtn clipping={clipping} me={me} />
        </div>
      </div>

      {/* Navigation Section */}
      <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-4">
          Navigation
        </h3>
        <SiblingNav
          clipping={clipping}
          iac={inAppChannel}
          domain={clippingDomain}
        />
      </div>
    </>
  )
}

export default ClippingSidebar
