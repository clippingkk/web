import BlurhashImage from '@annatarhe/blurhash-react'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { Star } from 'lucide-react'
import { WenquBook } from '../../services/wenqu'

type BookCandidateProps = {
  book: WenquBook
  selected: boolean
  onSelecte: (book: WenquBook) => void
}

function BookCandidate(props: BookCandidateProps) {
  const { book, selected } = props
  return (
    <div
      className={
        'flex cursor-pointer rounded-sm p-2 transition-colors duration-150 hover:bg-slate-300 hover:shadow-sm dark:hover:bg-slate-800 ' +
        (selected ? 'bg-slate-300 shadow-sm dark:bg-slate-800' : '')
      }
      onClick={() => props.onSelecte(book)}
    >
      <BlurhashImage
        width={135}
        height={192}
        src={book.image}
        alt={book.title}
        className="rounded-sm"
        blurhashValue={
          book.edges?.imageInfo?.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
        }
      />
      <div className="ml-4 w-144">
        <h3 className="inline-block text-3xl">
          {book.title}
          <div className="inline-block">
            <Tooltip content={`douban: ${book.rating}/10`}>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < Math.round(book.rating / 2) ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
            </Tooltip>
          </div>
        </h3>
        <h4 className="text-lg">{book.originTitle}</h4>
        <h4 className="text-sm">{book.author}</h4>
        <h5>{book.press}</h5>
        <p className="line-clamp-5">{book.summary}</p>
      </div>
    </div>
  )
}

export default BookCandidate
