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

function IndexPage() {
  usePageTrack('index')

  const {data } = useQuery<publicData>(fetchTopQuery)
  // const { data } = useSWR<TopHttpResponse>('/public/top')

  return (
    <div>
      <Hero />
      <div className='py-4 bg-gray-200 dark:bg-gray-600'>
        <TopBooks books={data?.public.books} />
        <TopUsers users={data?.public.users} />
      </div>
      <Footer />
    </div>
  )
}

export default IndexPage
