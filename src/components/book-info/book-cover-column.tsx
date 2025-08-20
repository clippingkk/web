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
    <div className="md:col-span-1">
      <div className="relative -mt-12 md:-mt-20 mx-auto w-64 md:w-full max-w-xs transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
        <div className="absolute inset-0 -z-10 blur-md opacity-30 scale-95 translate-y-4"></div>
        <BlurhashView
          blurhashValue={
            book.edges?.imageInfo?.blurHashValue ??
            'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
          }
          src={book.image}
          height={384}
          width={320}
          className="w-full aspect-[4/5] object-cover rounded-xl shadow-xl transition-all duration-300"
          alt={book.title}
        />
      </div>

      {/* Share button (mobile only) */}
      <div className="mt-6 flex justify-center md:hidden">
        <button
          onClick={() => togglePreviewVisible()}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Share2 className="w-5 h-5" />
          <span>{t('app.book.share')}</span>
        </button>
      </div>
    </div>
  )
}

export default BookCoverColumn
