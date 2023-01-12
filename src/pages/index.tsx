import React from 'react'
import Head from 'next/head'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Footer from '../components/footer/Footer'
import { usePageTrack } from '../hooks/tracke'
import { client } from '../services/ajax'
import Hero from './index/Hero'
import TopBooks from './index/TopBooks'
import TopClippings from './index/TopClippings'
import TopUsers from './index/TopUsers'
import OGWithIndex from '../components/og/og-with-index'
import Features from './index/Features'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../services/wenqu'
import { PublicData, PublicDataDocument, PublicDataQuery } from '../schema/generated'

export const getStaticProps: GetStaticProps<{ preloadPublicData: PublicDataQuery, books: WenquBook[] }> = async ({ locale }) => {
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

  let booksServerData: WenquBook[] = []

  if (dbIds.length >= 1) {
    const query = dbIds.join('&dbIds=')
    const books = await wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${query}`)
    const bsBooks = dbIds.reduce<WenquBook[]>((acc, cur) => {
      const bb = books.books.find(x => x.doubanId.toString() === cur)
      if (bb) {
        acc.push(bb)
      }
      return acc
    }, [])
    booksServerData.push(...bsBooks)
  }

  return {
    props: {
      preloadPublicData: data.data,
      books: booksServerData,
      // preloadPublicData: { public: {clippings: [], users: []}},
      // books: [],
    },
    revalidate: true
  }
}

function IndexPage({ preloadPublicData, books }: InferGetStaticPropsType<typeof getStaticProps>) {
  usePageTrack('index')
  const data = preloadPublicData

  return (
    <div>
      <Head>
        <title>ClippingKK - kindle 书摘管理</title>
        <OGWithIndex />
      </Head>
      <Hero />
      <div className='py-4 from-sky-100 to-green-200 bg-gradient-to-br dark:from-sky-900 dark:to-gray-800'>
        <TopBooks books={books} />
        <TopClippings clippings={data?.public.clippings} />
        <TopUsers users={data?.public.users} />
        <Features />
      </div>
      <Footer />
    </div>
  )
}

export default IndexPage
