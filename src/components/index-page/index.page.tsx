// 'use client'
import React from 'react'
import Hero from './Hero'
import { PublicDataQuery } from '@/schema/generated'
import Features from './Features'
import TopBooks from './TopBooks'
import TopClippings from './TopClippings'
import TopUsers from './TopUsers'
import { duration3Days } from '@/hooks/book'
import { getReactQueryClient } from '../../services/ajax'
import { wenquRequest, WenquSearchResponse } from '../../services/wenqu'
import PageTrack from '../track/page-track'
import { cookies } from 'next/headers'

type IndexPageProps = {
  publicData?: PublicDataQuery
  bgInfo: {
    src: string;
    blurHash: string;
  }
}

async function IndexPage(props: IndexPageProps) {

  const { publicData: data } = props
  const dbIds = data?.
    public.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  const cs = await cookies()
  const myUid = cs.get('uid')?.value
  const rq = getReactQueryClient()
  const bs = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })
  // const bs = useMultipleBook(dbIds)

  return (
    <>
      <Hero myUid={myUid ? parseInt(myUid) : undefined} />
      <div className='py-4 from-sky-100 to-green-200 bg-gradient-to-br dark:from-sky-900 dark:to-gray-800'>
        <TopBooks books={bs.books ?? []} />
        <TopClippings clippings={data?.public.clippings ?? []} />
        <TopUsers users={data?.public.users ?? []} />
        <Features />
      </div>
      <PageTrack page='index' />
    </>
  )
}

export default IndexPage
