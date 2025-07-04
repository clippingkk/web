import { generateMetadata as generateReportMetadata } from '@/components/og/og-with-report'
import { duration3Days } from '@/hooks/book'
import {
  FetchYearlyReportDocument,
  FetchYearlyReportQuery,
  FetchYearlyReportQueryVariables,
} from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { WenquBook, wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Metadata } from 'next'
import ReportYearly from './content'

type YearlyLegacyPageProps = {
  searchParams: Promise<{ year?: string; uid: string }>
}

export async function generateMetadata(
  props: YearlyLegacyPageProps
): Promise<Metadata> {
  const sp = await props.searchParams
  const uid = ~~sp.uid
  const year = sp?.year ? ~~sp.year : new Date().getFullYear()

  const client = getApolloServerClient()
  const reportInfoResponse = await client.query<
    FetchYearlyReportQuery,
    FetchYearlyReportQueryVariables
  >({
    query: FetchYearlyReportDocument,
    fetchPolicy: 'network-only',
    variables: {
      uid,
      year,
    },
  })
  const dbIds =
    reportInfoResponse.data.reportYearly.books
      .map((x) => x.doubanId)
      .filter((x) => x.length > 3) ?? []

  const bs = await wenquRequest<WenquSearchResponse>(
    `/books/search?dbIds=${dbIds.join('&dbIds=')}`
  )
  return generateReportMetadata(year, reportInfoResponse.data, bs.books)
}

async function YearlyPage(props: YearlyLegacyPageProps) {
  const sp = await props.searchParams
  const uid = ~~sp.uid
  const year = sp.year ? ~~sp.year : new Date().getFullYear()
  // const uid = ~~(context.params?.userid ?? -1) as number

  const client = getApolloServerClient()
  const reportInfoResponse = await client.query<
    FetchYearlyReportQuery,
    FetchYearlyReportQueryVariables
  >({
    query: FetchYearlyReportDocument,
    fetchPolicy: 'network-only',
    variables: {
      uid,
      year,
    },
  })
  const dbIds =
    reportInfoResponse.data.reportYearly.books
      .map((x) => x.doubanId)
      .filter((x) => x.length > 3) ?? []

  const rq = getReactQueryClient()

  let bs: WenquBook[] = []
  if (dbIds.length >= 1) {
    const prevLoadedBooks = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(
          `/books/search?dbIds=${dbIds.join('&dbIds=')}`
        ),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    bs = prevLoadedBooks.books
  }
  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
      <ReportYearly
        uid={uid}
        year={year}
        reportInfoServerData={reportInfoResponse.data}
        dbIds={dbIds}
        books={bs}
      />
    </HydrationBoundary>
  )
}

export default YearlyPage
