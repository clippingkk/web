import React from 'react'
import Hero from './Hero'
import Features from './Features'
import Footer from '../../components/footer/Footer'
import { usePageTrack } from '../../hooks/tracke'

function IndexPage() {
  usePageTrack('index')
  return (
    <div>
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}

export default IndexPage
