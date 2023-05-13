import React from 'react'
import ReportYearly from './content'
import { reactQueryClient } from '../../../services/ajax'
import { Hydrate, dehydrate } from '@tanstack/react-query'
import { duration3Days } from '../../../hooks/book'
import { FetchYearlyReportQuery, FetchYearlyReportQueryVariables, FetchYearlyReportDocument } from '../../../schema/generated'
import { wenquRequest, WenquSearchResponse } from '../../../services/wenqu'
import { generateMetadata as generateReportMetadata } from '../../../components/og/og-with-report'
import { Metadata } from 'next'
import { getApolloServerClient } from '../../../services/apollo.server'

type YearlyLegacyPageProps = {
  params: {}
  searchParams: { year?: string, uid: string }
}

export async function generateMetadata(props: YearlyLegacyPageProps): Promise<Metadata> {
  const uid = ~~props.searchParams.uid
  const year = props.searchParams.year ? ~~props.searchParams.year : new Date().getFullYear()

  const client = getApolloServerClient()
  const reportInfoResponse = await client.query<FetchYearlyReportQuery, FetchYearlyReportQueryVariables>({
    query: FetchYearlyReportDocument,
    fetchPolicy: 'network-only',
    variables: {
      uid,
      year
    },
  })
  const dbIds = reportInfoResponse.
    data.
    reportYearly.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  const bs = await wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`)
  return generateReportMetadata(year, reportInfoResponse.data, bs.books)
}

async function YearlyLegacyPage(props: YearlyLegacyPageProps) {
  const uid = ~~props.searchParams.uid
  const year = props.searchParams.year ? ~~props.searchParams.year : new Date().getFullYear()
  // const uid = ~~(context.params?.userid ?? -1) as number

  const client = getApolloServerClient()
  const reportInfoResponse = await client.query<FetchYearlyReportQuery, FetchYearlyReportQueryVariables>({
    query: FetchYearlyReportDocument,
    fetchPolicy: 'network-only',
    variables: {
      uid,
      year
    },
  })
  // const me = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const dbIds = reportInfoResponse.
    data.
    reportYearly.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  if (dbIds.length >= 1) {
    await reactQueryClient.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbIds', dbIds],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
      staleTime: duration3Days,
      cacheTime: duration3Days,
    })
  }
  const d = dehydrate(reactQueryClient)

  return (
    <Hydrate state={d}>
      <ReportYearly
        uid={uid}
        year={year}
        reportInfoServerData={reportInfoResponse.data}
        dbIds={dbIds}
      />
    </Hydrate>
  )
}

export default YearlyLegacyPage
