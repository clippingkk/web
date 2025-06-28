import ClippingRichContent from '@/components/text-content/clipping-rich-content'
import { CDN_DEFAULT_DOMAIN } from '@/constants/config'
import { useTranslation } from '@/i18n'
import { isGrandAdmin } from '@/services/admin'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Reactions from './reactions'
import { getClippingData } from '../data'

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
    <>
      <h1 className="font-lxgw my-2 text-xl font-bold lg:text-3xl">
        {bookData?.title ?? clipping.title}
      </h1>
      <h3 className="font-lxgw my-4 font-light lg:text-lg">
        {bookData?.author}
      </h3>
      <hr className="my-12 bg-gray-400" />
      <ClippingRichContent
        isPremium={isPremium}
        isGrandAdmin={isGrandAdmin({ id: me?.id })}
        className="font-lxgw text-3xl leading-normal lg:text-4xl lg:leading-loose"
        richContent={clipping.richContent}
        clippingId={clipping.id}
        bookId={clipping.bookID}
      />

      <hr className="my-12 bg-gray-400" />
      <Reactions
        reactions={clipping.reactionData}
        uid={uid ? ~~uid : undefined}
        cid={clipping.id || -1}
      />
      <hr className="my-12 bg-gray-400" />
      <footer className="mt-4 flex flex-col justify-between lg:flex-row">
        {me?.id === 0 && (
          <Link
            href={'/auth/auth-v4'}
            className="flex w-full items-center justify-start"
          >
            <Image
              src={
                creator?.avatar.startsWith('http')
                  ? creator.avatar
                  : `${CDN_DEFAULT_DOMAIN}/${creator?.avatar}`
              }
              className="inline-block h-12 w-12 transform rounded-full object-cover shadow-2xl duration-300 hover:scale-110"
              alt={creator.name}
              width={48}
              height={48}
            />
            <span className="ml-4 font-light text-gray-700 dark:text-gray-200">
              {creator?.name}
            </span>
          </Link>
        )}
        <time className="flex w-full items-center justify-end text-sm font-light text-gray-700 lg:text-base">
          {t('app.clipping.at')}: {clippingAt}
        </time>
      </footer>
    </>
  )
}

export default ClippingContent
