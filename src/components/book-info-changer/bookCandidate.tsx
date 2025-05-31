import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils' // Assuming cn is here, adjust if necessary
import { WenquBook } from '@/services/wenqu'
import BlurhashImage from '@annatarhe/blurhash-react'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import Rating from '../rating'

type BookCandidateProps = {
  book: WenquBook
  selected: boolean
  onSelecte: (book: WenquBook) => void
}

function BookCandidate(props: BookCandidateProps) {
  const { t } = useTranslation(undefined, 'book')
  const { book, selected } = props

  return (
    <li
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg p-3',
        'transition-all duration-200 ease-in-out',
        'border',
        selected
          ? 'ring-primary dark:bg-primary/20 border-slate-200 bg-slate-200/10 shadow-lg ring-2'
          : 'hover:border-primary/50 dark:hover:border-primary/70 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50',
        'transform hover:-translate-y-0.5 hover:shadow-xl'
      )}
      onClick={() => props.onSelecte(book)}
      role="option"
      aria-selected={selected}
    >
      <div className="flex-shrink-0">
        <BlurhashImage
          width={80} // Adjusted size for a more compact list item
          height={112} // Maintain aspect ratio
          src={book.image}
          alt={book.title}
          className="rounded-md object-cover shadow-sm"
          blurhashValue={
            book.edges?.imageInfo?.blurHashValue ??
            'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
          }
        />
      </div>
      <div className="flex-grow overflow-hidden">
        <h3 className="truncate text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100">
          {book.title}
        </h3>
        {book.originTitle && (
          <h4 className="truncate text-sm text-gray-600 dark:text-gray-400">
            {book.originTitle}
          </h4>
        )}
        {book.author && (
          <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {book.author}
          </p>
        )}
        <div className="mt-1 flex items-center">
          {book.rating !== undefined && book.rating !== null && (
            <Tooltip
              content={t('app.book.bookCandidate.ratingTooltip', {
                rating: book.rating.toFixed(1),
              })}
            >
              <div className="flex items-center">
                <Rating rating={book.rating} />
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  ({book.rating.toFixed(1)})
                </span>
              </div>
            </Tooltip>
          )}
        </div>
        {book.press && (
          <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
            {book.press}
          </p>
        )}
        {book.summary && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
            {book.summary}
          </p>
        )}
      </div>
    </li>
  )
}

export default BookCandidate
