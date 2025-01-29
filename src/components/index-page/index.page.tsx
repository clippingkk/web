import React from 'react'
import Hero from './Hero'
import { PublicDataQuery } from '@/schema/generated'
import Features from './Features'
import TopBooks from './TopBooks'
import TopClippings from './TopClippings'
import TopUsers from './TopUsers'
import { WenquBook } from '../../services/wenqu'
import PageTrack from '../track/page-track'
import { cookies } from 'next/headers'

type IndexPageProps = {
  publicData?: PublicDataQuery
  books: WenquBook[]
  bgInfo: {
    src: string;
    blurHash: string;
  }
}

async function IndexPage(props: IndexPageProps) {
  const { publicData: data, books: bs } = props
  const cs = await cookies()
  const myUid = cs.get('uid')?.value

  return (
    <>
      <Hero myUid={myUid ? parseInt(myUid) : undefined} />
      <div className='py-4 from-sky-100 to-green-200 bg-gradient-to-br dark:from-sky-900 dark:to-gray-800'>
        <TopBooks books={bs} />
        <TopClippings clippings={data?.public.clippings ?? []} />
        <TopUsers users={data?.public.users ?? []} />
        <Features />
      </div>
      <PageTrack page='index' />
    </>
  )
}

export default IndexPage
