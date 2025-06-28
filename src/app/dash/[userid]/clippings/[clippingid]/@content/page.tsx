import ClippingRichContent from '@/components/text-content/clipping-rich-content'
import { CDN_DEFAULT_DOMAIN } from '@/constants/config'
import { useTranslation } from '@/i18n'
import { isGrandAdmin } from '@/services/admin'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Reactions from './reactions'
import { getClippingData } from '../data'
import ElegantDivider from '@/components/divider/elegant-divider'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
}

async function ClippingContent(props: PageProps) {
  const { clippingid } = await props.params
  const cid = ~~clippingid
  
  const { clipping, me, bookData, uid } = await getClippingData(cid)
  
  const creator = clipping.creator
  const isPremium = me?.premiumEndAt
    ? new Date(me.premiumEndAt).getTime() > new Date().getTime()
    : false
  const clippingAt = clipping?.createdAt
  const { t } = await useTranslation()

  return (
    <div className="space-y-8">
      {/* Book title and author section */}
      <div className="space-y-3">
        <h1 className="font-lxgw text-2xl font-bold text-gray-900 dark:text-zinc-50 lg:text-4xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
          {bookData?.title ?? clipping.title}
        </h1>
        <h3 className="font-lxgw text-lg font-light text-gray-600 dark:text-zinc-400 lg:text-xl">
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
          className="font-lxgw text-2xl leading-relaxed text-gray-800 dark:text-zinc-200 lg:text-3xl lg:leading-relaxed selection:bg-blue-200 dark:selection:bg-blue-900/50"
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
      <footer className="pt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {me?.id === 0 && (
          <Link
            href={'/auth/auth-v4'}
            className="group flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl p-3 -ml-3 transition-all duration-200"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <Image
                src={
                  creator?.avatar.startsWith('http')
                    ? creator.avatar
                    : `${CDN_DEFAULT_DOMAIN}/${creator?.avatar}`
                }
                className="relative h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-zinc-700 group-hover:ring-blue-400 dark:group-hover:ring-blue-400 transition-all duration-300"
                alt={creator.name}
                width={48}
                height={48}
              />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-zinc-50 transition-colors">
              {creator?.name}
            </span>
          </Link>
        )}
        <time className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-500 lg:text-base">
          <span className="inline-block w-1 h-1 bg-gray-400 dark:bg-zinc-600 rounded-full" />
          {t('app.clipping.at')}: {clippingAt}
        </time>
      </footer>
    </div>
  )
}

export default ClippingContent
