import { PublicDataQuery } from '@/schema/generated'
import { cookies } from 'next/headers'
import Features from './Features'
import Hero from './Hero'
import TopBooks from './TopBooks'
import TopClippings from './TopClippings'
import TopUsers from './TopUsers'
import { WenquBook } from '../../services/wenqu'
import PageTrack from '../track/page-track'
import PureImages from '../backgrounds/pure-images'

type IndexPageProps = {
  publicData?: PublicDataQuery
  books: WenquBook[]
  bgInfo: {
    src: string;
    blurHash: string;
  }
}

async function IndexPage(props: IndexPageProps) {
  const { publicData: data, books: bs } = props
  const cs = await cookies()
  const myUid = cs.get('uid')?.value

  return (
    <>
      {/* Hero section */}
      <Hero myUid={myUid ? parseInt(myUid) : undefined} />
      
      {/* Main content with deep, elegant background */}
      <div className="relative overflow-hidden bg-slate-900">
        {/* Background layers with similar effect to Hero */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 to-slate-900">
          <PureImages lightingColor={'rgb(2, 6, 23)'} />
          <div className="absolute inset-0 bg-black opacity-50"></div>
          
          {/* Additional background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Glowing orbs */}
            <div className="absolute top-[5%] left-[15%] h-80 w-80 rounded-full bg-blue-500/5 blur-3xl opacity-70"></div>
            <div className="absolute bottom-[30%] right-[10%] h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl opacity-60"></div>
            <div className="absolute top-[40%] left-[50%] h-72 w-72 rounded-full bg-purple-500/5 blur-3xl opacity-70"></div>
            
            {/* Gradient ribbons */}
            <div className="absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            <div className="absolute top-[60%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          </div>
        </div>
        
        {/* Content sections with z-index to appear above background */}
        <div className="relative z-10">
          <TopBooks books={bs} />
          <TopClippings clippings={data?.public.clippings ?? []} />
          <TopUsers users={data?.public.users ?? []} />
          <Features />
        </div>
      </div>
      
      <PageTrack page="index" />
    </>
  )
}

export default IndexPage
