import BlurhashView from '@annatarhe/blurhash-react'
import type { ReactNode } from 'react'

import type { WenquBook } from '../../services/wenqu'

type Props = {
  book: WenquBook
  mobileShareAction?: ReactNode
}

function BookCoverColumn({ book, mobileShareAction }: Props) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative mx-auto w-full transform transition-all duration-500 hover:scale-[1.01] md:hover:-rotate-[1.25deg]">
        <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-cyan-200/55 via-sky-200/35 to-amber-100/30 blur-3xl dark:from-cyan-500/18 dark:via-sky-500/10 dark:to-amber-400/8" />
        <div className="absolute inset-0 rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/35" />

        <BlurhashView
          blurhashValue={
            book.edges?.imageInfo?.blurHashValue ??
            'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
          }
          src={book.image}
          height={384}
          width={320}
          className="relative aspect-[4/5] w-full rounded-[1.75rem] object-cover p-3 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.55)] transition-all duration-300"
          alt={book.title}
        />
      </div>

      {mobileShareAction ? (
        <div className="mt-6 flex justify-center md:hidden">
          {mobileShareAction}
        </div>
      ) : null}
    </div>
  )
}

export default BookCoverColumn
