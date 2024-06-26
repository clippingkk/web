'use client';
import React from 'react'
import Hero from './Hero'
import { PublicDataQuery } from '../../schema/generated'
import Features from './Features'
import TopBooks from './TopBooks'
import TopClippings from './TopClippings'
import TopUsers from './TopUsers'
import { useMultipleBook } from '../../hooks/book'
import { usePageTrack } from '../../hooks/tracke';

type IndexPageProps = {
  publicData?: PublicDataQuery
  bgInfo: {
    src: string;
    blurHash: string;
  }
}

function IndexPage(props: IndexPageProps) {
  usePageTrack('index')
  const { publicData: data, bgInfo } = props
  const dbIds = data?.
    public.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  const bs = useMultipleBook(dbIds)

  return (
    <>
      <Hero bgInfo={bgInfo} />
      <div className='py-4 from-sky-100 to-green-200 bg-gradient-to-br dark:from-sky-900 dark:to-gray-800'>
        <TopBooks books={bs.books ?? []} />
        <TopClippings clippings={data?.public.clippings ?? []} />
        <TopUsers users={data?.public.users ?? []} />
        <Features />
      </div>
    </>
  )
}

export default IndexPage
