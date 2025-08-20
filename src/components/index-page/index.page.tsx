import { cookies } from 'next/headers'
import { USER_ID_KEY } from '@/constants/storage'
import type { PublicDataQuery } from '@/schema/generated'
import type { WenquBook } from '../../services/wenqu'
import PureImages from '../backgrounds/pure-images'
import PageTrack from '../track/page-track'
import Features from './Features'
import Hero from './Hero'
import TopBooks from './TopBooks'
import TopClippings from './TopClippings'
import TopUsers from './TopUsers'

type IndexPageProps = {
  publicData?: PublicDataQuery
  books: WenquBook[]
  bgInfo: {
    src: string
    blurHash: string
  }
}

async function IndexPage(props: IndexPageProps) {
  const { publicData: data, books: bs } = props
  const cs = await cookies()
  const myUid = cs.get(USER_ID_KEY)?.value

  return (
    <>
      {/* Hero section */}
      <Hero myUid={myUid ? parseInt(myUid) : undefined} />

      {/* Main content with elegant background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950">
        {/* Background layers with theme-aware effects */}
        <div className="absolute inset-0 z-0">
          <PureImages lightingColor={'rgb(2, 6, 23)'} />
          <div className="absolute inset-0 bg-blue-50/70 backdrop-blur-sm dark:bg-black/50"></div>

          {/* Additional background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Glowing orbs */}
            <div className="absolute top-[5%] left-[15%] h-80 w-80 rounded-full bg-blue-300/30 opacity-60 blur-3xl dark:bg-blue-500/5 dark:opacity-70"></div>
            <div className="absolute right-[10%] bottom-[30%] h-96 w-96 rounded-full bg-indigo-300/25 opacity-50 blur-3xl dark:bg-indigo-500/5 dark:opacity-60"></div>
            <div className="absolute top-[40%] left-[50%] h-72 w-72 rounded-full bg-violet-300/30 opacity-60 blur-3xl dark:bg-violet-500/5 dark:opacity-70"></div>

            {/* Gradient ribbons */}
            <div className="absolute top-[20%] right-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent dark:via-blue-500/20"></div>
            <div className="absolute top-[60%] right-0 left-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent dark:via-indigo-500/20"></div>
          </div>
        </div>

        {/* Content sections with z-index to appear above background */}
        <div className="relative z-10 bg-blue-50/40 backdrop-blur-sm dark:bg-transparent">
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
