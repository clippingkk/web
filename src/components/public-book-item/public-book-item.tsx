import BlurhashView from '@annatarhe/blurhash-react'
import { WenquBook } from '../../services/wenqu'
import styles from './style.module.css'

type PublicBookItemProps = {
  book: WenquBook
}

function PublicBookItem(props: PublicBookItemProps) {
  const book = props.book
  return (
    <div
      className={
        'relative transform rounded-sm shadow-2xl transition-all duration-300 hover:scale-110'
      }
    >
      <BlurhashView
        blurhashValue={
          book.edges?.imageInfo?.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
        }
        src={book.image}
        height={384}
        width={288}
        className="h-96 w-72 rounded-sm object-cover"
        alt={book.title}
      />
      <div
        className={
          'absolute bottom-0 left-0 w-full rounded-b px-4 py-8 text-white ' +
          styles['book-info']
        }
      >
        <h2 className="text-right text-2xl">{book.title}</h2>
        <h3 className="line-clamp-2 text-right text-sm italic">
          {book.author}
        </h3>
      </div>
    </div>
  )
}

export default PublicBookItem
