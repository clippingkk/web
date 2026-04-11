import Footer from '../components/footer/Footer'
import IndexPage from '../components/index-page/index.page'
import { getBackgroundImageServer } from '../hooks/theme.server'
import { PublicDataDocument, type PublicDataQuery } from '../schema/generated'
import { getReactQueryClient } from '../services/ajax'
import { doApolloServerQuery } from '../services/apollo.server'
import {
  isValidDoubanId,
  wenquBooksByIdsQueryOptions,
} from '../services/wenqu'

async function Page() {
  const data = await doApolloServerQuery<PublicDataQuery>({
    query: PublicDataDocument,
    fetchPolicy: 'network-only',
  })

  const dbIds =
    data.data?.public.books.map((x) => x.doubanId).filter(isValidDoubanId) ?? []

  const rq = getReactQueryClient()
  const bs = await rq.fetchQuery(wenquBooksByIdsQueryOptions(dbIds))
  const bgInfo = await getBackgroundImageServer()
  return (
    <>
      <IndexPage bgInfo={bgInfo} publicData={data.data} books={bs.books} />
      <Footer />
    </>
  )
}

export default Page
