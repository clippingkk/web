import React from 'react'
import { WenquBook } from '@/services/wenqu'
import { UserContent } from '@/store/user/type'
import { IN_APP_CHANNEL } from '@/services/channel'
import { Clipping, User } from '@/schema/generated'
import ClippingShareButton from '@/components/clipping-sidebars/share-clipping-btn'
import CopyEmbedHTMLBtn from '@/components/clipping-sidebars/copy-embed-html-btn'
import DoubanLinkBtn from '@/components/clipping-sidebars/douban-link.btn'
import VisibleToggle from '@/components/clipping-sidebars/visible-toggle'
import SiblingNav from '@/components/clipping-sidebars/sibling-nav'
import UpdateClippingBtn from '@/components/clipping-sidebars/update-clipping-btn'
import AISummaryBtn from '@/components/clipping-sidebars/ai-summary-btn'

type ClippingSidebarProps = {
  clipping?: Pick<Clipping, 'id' | 'visible' | 'content' | 'title' | 'createdAt' | 'nextClipping' | 'prevClipping'> & { creator: Pick<User, 'id' | 'name' | 'domain' | 'avatar' > }
  book: WenquBook | null
  me?: UserContent
  inAppChannel: IN_APP_CHANNEL
}

function ClippingSidebar(props: ClippingSidebarProps) {
  const { clipping, me, inAppChannel, book } = props

  const clippingDomain = clipping ?
    (
      clipping.creator.domain.length > 2 ?
        clipping.creator.domain :
        clipping.creator.id.toString()
    ) :
    me?.id.toString()

  return (
    <div className='flex-1 p-4 shadow bg-slate-200 dark:bg-slate-800 my-4 rounded bg-opacity-50 dark:bg-opacity-50 backdrop-blur'>
      <div className='flex w-full h-full flex-col justify-between items-center'>
        <ul className='w-full p-0 list-none'>
          <AISummaryBtn clipping={clipping} me={me} book={book} />
          <ClippingShareButton
            book={book}
            clipping={clipping}
          />
          <DoubanLinkBtn book={book} />
          <CopyEmbedHTMLBtn clipping={clipping} book={book} />
          <VisibleToggle clipping={clipping} me={me} />
          <UpdateClippingBtn clipping={clipping} me={me} />
        </ul>
        <ul className='w-full p-0 list-none'>
          <SiblingNav clipping={clipping} iac={inAppChannel} domain={clippingDomain} />
        </ul>
      </div>
    </div>
  )
}

export default ClippingSidebar
