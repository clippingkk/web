import BlurhashView from '@annatarhe/blurhash-react'
import { Share2 } from 'lucide-react'

import { useTranslation } from '@/i18n/client'

import type { WenquBook } from '../../services/wenqu'

type Props = {
  book: WenquBook
  togglePreviewVisible: () => void
}

function BookCoverColumn({ book, togglePreviewVisible }: Props) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="relative mx-auto w-full max-w-[320px] transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
        {/* Colored shadow behind cover */}
        <div className="absolute inset-4 -z-10 translate-y-4 scale-95 rounded-2xl bg-blue-400/30 opacity-40 blur-2xl dark:bg-blue-500/20" />
        <BlurhashView
          blurhashValue={
            book.edges?.imageInfo?.blurHashValue ??
            'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
          }
          src={book.image}
          height={384}
          width={320}
          className="aspect-[4/5] w-full rounded-xl object-cover shadow-2xl transition-all duration-300"
          alt={book.title}
        />
      </div>

      {/* Share button (mobile only) */}
      <div className="mt-6 flex justify-center md:hidden">
        <button
          onClick={() => togglePreviewVisible()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
        >
          <Share2 className="h-5 w-5" />
          <span>{t('app.book.share')}</span>
        </button>
      </div>
    </div>
  )
}

export default BookCoverColumn
