import { IN_APP_CHANNEL } from '@/services/channel'
import ClippingSidebar from '../clipping-sidebar'
import { getClippingData } from '../data'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
  searchParams: Promise<{ iac: string }>
}

async function SidebarContent(props: PageProps) {
  const { clippingid } = await props.params
  const iac = (await props.searchParams).iac
  const cid = ~~clippingid
  
  const { clipping, me, bookData } = await getClippingData(cid)

  return (
    <ClippingSidebar
      clipping={clipping}
      book={bookData}
      me={me}
      inAppChannel={parseInt(iac) as IN_APP_CHANNEL}
    />
  )
}

export default SidebarContent