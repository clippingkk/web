import type { Metadata } from 'next'
import { generateMetadata as clippingGenerateMetadata } from '@/components/og/og-with-clipping'
import { getClippingData } from './data'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
  searchParams: Promise<{ iac: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { clippingid } = await props.params
  const cid = ~~clippingid

  const { clipping, bookData } = await getClippingData(cid)

  return clippingGenerateMetadata({
    clipping,
    book: bookData,
  })
}

// The page component is now empty since all content is handled by parallel routes
function Page() {
  return null
}

export default Page
