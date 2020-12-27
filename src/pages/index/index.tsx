import React from 'react'
import useSWR from 'swr'
import Hero from './Hero'
import Features from './Features'
import Footer from '../../components/footer/Footer'
import { usePageTrack } from '../../hooks/tracke'
import { TopHttpResponse } from '../../services/public'
import TopBooks from './TopBooks'
import TopUsers from './TopUsers'
import fetchTopQuery from '../../schema/public.graphql'
import { useQuery } from '@apollo/client'
import { publicData } from '../../schema/__generated__/publicData'
import TopClippings from './TopClippings'

function IndexPage() {
  usePageTrack('index')
  const {data } = useQuery<publicData>(fetchTopQuery)

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
