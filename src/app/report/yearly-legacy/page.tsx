import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { generateMetadata as generateReportMetadata } from '@/components/og/og-with-report'
import {
  FetchYearlyReportDocument,
  type FetchYearlyReportQuery,
  type FetchYearlyReportQueryVariables,
} from '@/gql/graphql'
import { duration3Days } from '@/hooks/book'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { type WenquSearchResponse, wenquRequest } from '@/services/wenqu'
import ReportYearly from './content'

type YearlyLegacyPageProps = {
  params: Promise<object>
  searchParams: Promise<{ year?: string; uid: string }>
}

export async function generateMetadata(
  props: YearlyLegacyPageProps
): Promise<Metadata> {
  const sp = await props.searchParams
  const uid = ~~sp.uid
  const year = sp.year ? ~~sp.year : new Date().getFullYear()

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
    reportInfoResponse.data?.reportYearly?.books
      ?.map((x) => x.doubanId)
      .filter((x) => x.length > 3) ?? []

  const bs = await wenquRequest<WenquSearchResponse>(
    `/books/search?dbIds=${dbIds.join('&dbIds=')}`
  )
  return generateReportMetadata(year, reportInfoResponse.data ?? undefined, bs.books)
}

async function YearlyLegacyPage(props: YearlyLegacyPageProps) {
  const sp = await props.searchParams
  const uid = ~~sp.uid
  const year = sp.year ? ~~sp.year : new Date().getFullYear()

  const client = getApolloServerClient()
  // const uid = ~~(context.params?.userid ?? -1) as number
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
    reportInfoResponse.data?.reportYearly?.books
      ?.map((x) => x.doubanId)
      .filter((x) => x.length > 3) ?? []

  const rq = getReactQueryClient()
  if (dbIds.length >= 1) {
    await rq.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(
          `/books/search?dbIds=${dbIds.join('&dbIds=')}`
        ),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
  }
  const d = dehydrate(rq)

  return (
    <HydrationBoundary state={d}>
      <ReportYearly
        uid={uid}
        year={year}
        reportInfoServerData={reportInfoResponse.data}
        dbIds={dbIds}
      />
    </HydrationBoundary>
  )
}

export default YearlyLegacyPage
