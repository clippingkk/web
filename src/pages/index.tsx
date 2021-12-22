import React from 'react'
import { useQuery } from '@apollo/client'
import Head from 'next/head'
import fetchTopQuery from '../schema/public.graphql'
import { publicData } from '../schema/__generated__/publicData'
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

export const getStaticProps: GetStaticProps = async () => {
  const data = await client.query<publicData>({ 
    query: fetchTopQuery,
    fetchPolicy: 'network-only'
  })

  return {
    props: {
      preloadPublicData: data.data
    },
    revalidate: true
  }
}

function IndexPage({ preloadPublicData }: InferGetStaticPropsType<typeof getStaticProps>) {
  usePageTrack('index')
  const data = preloadPublicData

  return (
    <div>
      <Head>
        <title>ClippingKK - kindle 书摘管理</title>
        <OGWithIndex />
        </Head>
      <Hero />
      <div className='py-4 anna-page-container'>
        <TopBooks books={data?.public.books} />
        <TopClippings clippings={data?.public.clippings} />
        <TopUsers users={data?.public.users} />
        <Features />
      </div>
      <Footer />
    </div>
  )
}

export default IndexPage
