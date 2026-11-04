'use client'

import Tabs, { TabPanel } from '@annatarhe/lake-ui/tabs'
import type React from 'react'
import { useState } from 'react'

import type { CommentItemData } from '@/components/comment/comment-item'
import CommentThread from '@/components/comment/comment-thread'
import { useTranslation } from '@/i18n/client'

import { BOOK_TABS_ID, useBookTab } from './book-tab'

type BookTabsProps = {
  doubanId: string
  bookTitle: string
  highlightsCount: number
  /** The book's highlights, rendered by the page. */
  highlights: React.ReactNode
  initialComments: CommentItemData[]
  commentsCount: number
  commentsPageSize: number
  viewer: {
    id: number
    name: string
    avatar?: string | null
    isPremium: boolean
    isAdmin: boolean
  } | null
}

/** Highlights and Discussion, under the book header. */
function BookTabs(props: BookTabsProps) {
  const {
    doubanId,
    bookTitle,
    highlightsCount,
    highlights,
    initialComments,
    commentsCount,
    commentsPageSize,
    viewer,
  } = props
  const { t } = useTranslation(undefined, 'library')
  const [tab, setTab] = useBookTab()
  const [count, setCount] = useState(commentsCount)

  return (
    <div className="flex flex-col gap-8">
      <div id={BOOK_TABS_ID} className="scroll-mt-24">
        <Tabs
          aria-label={t('book.tabs.label')}
          idBase="book"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: 'highlights',
              label: t('book.tabs.highlights'),
              count: highlightsCount,
            },
            {
              value: 'discussion',
              label: t('book.tabs.discussion'),
              count,
            },
          ]}
        />
      </div>
      <TabPanel idBase="book" value="highlights" activeValue={tab} keepMounted>
        {highlights}
      </TabPanel>
      <TabPanel idBase="book" value="discussion" activeValue={tab} keepMounted>
        <div className="max-w-2xl">
          <CommentThread
            target={{ kind: 'book', doubanId }}
            headingId="book-discussion-title"
            bookTitle={bookTitle}
            initialItems={initialComments}
            initialCount={commentsCount}
            pageSize={commentsPageSize}
            viewer={viewer}
            onCountChange={setCount}
          />
        </div>
      </TabPanel>
    </div>
  )
}

export default BookTabs
