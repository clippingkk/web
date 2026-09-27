'use client'

import BlurhashView from '@annatarhe/blurhash-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import type { WenquBook } from '@/services/wenqu'

type BookCoverProps = {
  book?: Pick<WenquBook, 'image' | 'title' | 'author' | 'edges'> | null
  /** Used for the typographic cover when there is no image. */
  title: string
  author?: string | null
  className?: string
}

const FALLBACK_BLURHASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'

/**
 * A 2:3 book cover. Without a Wenqu image (or when it fails to load) it
 * renders a quiet typographic "paper" cover instead of a broken image.
 */
function BookCover({ book, title, author, className }: BookCoverProps) {
  const [failed, setFailed] = useState(false)
  const showImage = !!book?.image && !failed

  return (
    <div
      className={cn(
        'rounded-lake-control border-lake-line bg-lake-surface-muted relative aspect-[2/3] w-full overflow-hidden border shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.25)]',
        className
      )}
    >
      {showImage ? (
        <BlurhashView
          blurhashValue={
            book?.edges?.imageInfo?.blurHashValue ?? FALLBACK_BLURHASH
          }
          src={book!.image}
          width={32}
          height={48}
          alt={book?.title ?? title}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full flex-col justify-between p-[10%]">
          <span
            aria-hidden="true"
            className="bg-lake-line-strong block h-px w-1/3"
          />
          <p className="font-reading text-lake-fg [container-type:inline-size] line-clamp-5 text-[clamp(0.75rem,6cqw,1.125rem)] leading-snug font-semibold">
            {book?.title || title}
          </p>
          <p className="text-lake-fg-subtle line-clamp-2 text-[0.6875rem]">
            {book?.author || author || ''}
          </p>
        </div>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/15 to-transparent"
      />
    </div>
  )
}

export default BookCover
