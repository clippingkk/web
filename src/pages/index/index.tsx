import React from 'react'
import useSWR from 'swr'
import Hero from './Hero'
import Features from './Features'
import Footer from '../../components/footer/Footer'
import { usePageTrack } from '../../hooks/tracke'
import { TopHttpResponse } from '../../services/public'
import TopBooks from './TopBooks'
import TopUsers from './TopUsers'

function IndexPage() {
  usePageTrack('index')

  const { data } = useSWR<TopHttpResponse>('/public/top')

  return (
    <div>
      <Hero />
      <div style={{ backgroundColor: '#f8f8f8' }} className='pb-4'>
        <TopBooks books={data?.books} />
        <TopUsers users={data?.users} />
      </div>
      <Footer />
    </div>
  )
}

export default IndexPage
