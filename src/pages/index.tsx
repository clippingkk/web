import React from 'react'
import Head from 'next/head'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Footer from '../components/footer/Footer'
import { usePageTrack } from '../hooks/tracke'
import { client, reactQueryClient } from '../services/ajax'
import Hero from './index/Hero'
import TopBooks from './index/TopBooks'
import TopClippings from './index/TopClippings'
import TopUsers from './index/TopUsers'
import OGWithIndex from '../components/og/og-with-index'
import Features from './index/Features'
import { wenquRequest, WenquSearchResponse } from '../services/wenqu'
import { PublicDataDocument, PublicDataQuery } from '../schema/generated'
import { dehydrate } from '@tanstack/react-query'
import { useBookSearch, useMultipBook } from '../hooks/book'

export const getStaticProps: GetStaticProps<{ preloadPublicData: PublicDataQuery }> = async ({ locale }) => {
  const data = await client.query<PublicDataQuery>({
    query: PublicDataDocument,
    fetchPolicy: 'network-only'
  })

  const dbIds = data.
    data.
    public.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  if (dbIds.length >= 1) {
    await reactQueryClient.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    })
  }

  return {
    props: {
      dehydratedState: dehydrate(reactQueryClient),
      preloadPublicData: data.data,
    },
    revalidate: true
  }
}

function IndexPage({ preloadPublicData }: InferGetStaticPropsType<typeof getStaticProps>) {
  usePageTrack('index')
  const data = preloadPublicData

  const dbIds = data.
    public.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []
  const bs = useMultipBook(dbIds)

  return (
    <div>
      <Head>
        <title>ClippingKK - kindle 书摘管理</title>
        <OGWithIndex />
      </Head>
      <Hero />
      <div className='py-4 from-sky-100 to-green-200 bg-gradient-to-br dark:from-sky-900 dark:to-gray-800'>
        <TopBooks books={bs.books ?? []} />
        <TopClippings clippings={data?.public.clippings} />
        <TopUsers users={data?.public.users} />
        <Features />
      </div>
      <Footer />
    </div>
  )
}

export default IndexPage
