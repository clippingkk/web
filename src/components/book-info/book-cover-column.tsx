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
      <div className='relative mx-auto w-full max-w-[320px] transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1'>
        {/* Colored shadow behind cover */}
        <div className='absolute inset-4 -z-10 rounded-2xl bg-blue-400/30 opacity-40 blur-2xl translate-y-4 scale-95 dark:bg-blue-500/20' />
        <BlurhashView
          blurhashValue={
            book.edges?.imageInfo?.blurHashValue ??
            'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
          }
          src={book.image}
          height={384}
          width={320}
          className='w-full aspect-[4/5] object-cover rounded-xl shadow-2xl transition-all duration-300'
          alt={book.title}
        />
      </div>

      {/* Share button (mobile only) */}
      <div className='mt-6 flex justify-center md:hidden'>
        <button
          onClick={() => togglePreviewVisible()}
          className='w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300'
        >
          <Share2 className='w-5 h-5' />
          <span>{t('app.book.share')}</span>
        </button>
      </div>
    </div>
  )
}

export default BookCoverColumn
