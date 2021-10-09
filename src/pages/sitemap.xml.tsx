import { GetServerSideProps } from 'next'
import { SitemapStream, streamToPromise } from 'sitemap'
import { createGzip } from 'zlib'
import { Readable } from 'stream'
import React from 'react'

type SiteMapProps = {
}

function SiteMap(props: SiteMapProps) {
  return null
}

export const getServerSideProps: GetServerSideProps<any> = async ({ res }) => {
  res.setHeader('Content-Type', 'application/xml')

  const links = [
    { url: '/', changefreq: 'monthly', priority: 1 },
    { url: '/auth/signin', changefreq: 'monthly', priority: 0.1 },
    { url: '/auth/phone', changefreq: 'monthly', priority: 0.1 }
  ]
  const smStream = new SitemapStream({ hostname: 'https://clippingkk.annatarhe.com' })
  const result = await streamToPromise(Readable.from(links).pipe(smStream))
  res.write(result.toString())
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
