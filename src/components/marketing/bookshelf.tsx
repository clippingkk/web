import BookCard from '@/components/book/book-card'
import { slimBook } from '@/components/book/slim-book'
import { getTranslation } from '@/i18n'
import type { WenquBook } from '@/services/wenqu'
import { bookHref } from '@/utils/profile.utils'

import type { ShelfBook } from './landing-data'
import MarketingSection from './marketing-section'

type BookshelfProps = {
  books: ShelfBook[]
  wenqu: ReadonlyMap<string, WenquBook>
}

async function Bookshelf({ books, wenqu }: BookshelfProps) {
  if (books.length === 0) return null
  const { t } = await getTranslation(undefined, 'marketing')
  return (
    <MarketingSection
      id="shelves"
      eyebrow={t('books.eyebrow')}
      title={t('books.title')}
      description={t('books.description')}
    >
      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {books.map((b) => (
          <li key={b.doubanId}>
            <BookCard
              href={bookHref(b.owner, b.doubanId)}
              doubanId={b.doubanId}
              book={slimBook(wenqu.get(b.doubanId))}
              title={b.title}
            />
          </li>
        ))}
      </ul>
    </MarketingSection>
  )
}

export default Bookshelf
