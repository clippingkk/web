import React from 'react'
import Hero from './Hero'
import Footer from '../../components/footer/Footer'
import { usePageTrack } from '../../hooks/tracke'
import TopBooks from './TopBooks'
import TopUsers from './TopUsers'
import fetchTopQuery from '../../schema/public.graphql'
import { useQuery } from '@apollo/client'
import { publicData } from '../../schema/__generated__/publicData'
import TopClippings from './TopClippings'
import { client } from '../../services/ajax'
import { InferGetStaticPropsType } from 'next'

export const getStaticProps = async () => {
  const data = await client.query<publicData>({ 
    query: fetchTopQuery
  })

  return {
    props: {
      preloadPublicData: data.data
    },
  }
}

function IndexPage({ preloadPublicData }: InferGetStaticPropsType<typeof getStaticProps>) {
  usePageTrack('index')
  const { data: newData } = useQuery<publicData>(fetchTopQuery, {
    skip: !preloadPublicData
  })

  const data = preloadPublicData ?? newData

  return (
    <div>
      <Hero />
      <div className='py-4 anna-page-container'>
        <TopBooks books={data?.public.books} />
        <TopClippings clippings={data?.public.clippings} />
        <TopUsers users={data?.public.users} />
      </div>
      <Footer />
    </div>
  )
}

export default IndexPage
