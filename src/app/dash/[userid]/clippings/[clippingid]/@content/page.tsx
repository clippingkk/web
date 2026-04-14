import Image from 'next/image'
import Link from 'next/link'

import ElegantDivider from '@/components/divider/elegant-divider'
import ClippingRichContent from '@/components/text-content/clipping-rich-content'
import { checkIsPremium } from '@/compute/user'
import { getTranslation } from '@/i18n'
import { isGrandAdmin } from '@/services/admin'
import { resolveMediaUrl } from '@/utils/image'

import { getClippingData } from '../data'
import Reactions from './reactions'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
}

async function ClippingContent(props: PageProps) {
  const { clippingid } = await props.params
  const cid = ~~clippingid

  const { clipping, me, bookData, uid } = await getClippingData(cid)

  const creator = clipping.creator
  const isPremium = checkIsPremium(me?.premiumEndAt)
  const clippingAt = clipping?.createdAt
  const { t } = await getTranslation()

  return (
    <div className="space-y-8">
      {/* Book title and author section */}
      <div className="space-y-3">
        <h1 className="font-lxgw bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-gray-900 text-transparent lg:text-4xl dark:from-zinc-50 dark:to-zinc-300 dark:text-zinc-50">
          {bookData?.title ?? clipping.title}
        </h1>
        <h3 className="font-lxgw text-lg font-light text-gray-600 lg:text-xl dark:text-zinc-400">
          {bookData?.author}
        </h3>
      </div>

      {/* Elegant divider */}
      <ElegantDivider color="blue" intensity="medium" />

      {/* Main content with enhanced typography */}
      <div className="relative py-8">
        <ClippingRichContent
          isPremium={isPremium}
          isGrandAdmin={isGrandAdmin({ id: me?.id })}
          className="font-lxgw text-2xl leading-relaxed text-gray-800 selection:bg-blue-200 lg:text-3xl lg:leading-relaxed dark:text-zinc-200 dark:selection:bg-blue-900/50"
          richContent={clipping.richContent}
          clippingId={clipping.id}
          bookId={clipping.bookID}
        />
      </div>

      {/* Elegant divider */}
      <ElegantDivider color="purple" intensity="medium" />

      {/* Reactions section with modern styling */}
      <div className="py-4">
        <Reactions
          reactions={clipping.reactionData}
          uid={uid ? ~~uid : undefined}
          cid={clipping.id || -1}
        />
      </div>

      {/* Elegant divider */}
      <ElegantDivider color="gray" intensity="light" />

      {/* Footer with enhanced design */}
      <footer className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
        {me?.id === 0 && (
          <Link
            href={'/auth/auth-v4'}
            className="group -ml-3 flex items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-30" />
              <Image
                src={resolveMediaUrl(creator?.avatar)}
                className="relative h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-blue-400 dark:ring-zinc-700 dark:group-hover:ring-blue-400"
                alt={creator.name}
                width={48}
                height={48}
              />
            </div>
            <span className="font-medium text-gray-700 transition-colors group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-zinc-50">
              {creator?.name}
            </span>
          </Link>
        )}
        <time className="flex items-center gap-2 text-sm text-gray-500 lg:text-base dark:text-zinc-500">
          <span className="inline-block h-1 w-1 rounded-full bg-gray-400 dark:bg-zinc-600" />
          {t('app.clipping.at')}: {clippingAt}
        </time>
      </footer>
    </div>
  )
}

export default ClippingContent
