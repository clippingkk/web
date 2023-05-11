import React from 'react'
import { duration3Days } from '../../../../../hooks/book'
import { FetchClippingQuery, FetchClippingQueryVariables, FetchClippingDocument } from '../../../../../schema/generated'
import { client, reactQueryClient } from '../../../../../services/ajax'
import { wenquRequest, WenquSearchResponse } from '../../../../../services/wenqu'
import { Hydrate, dehydrate } from '@tanstack/react-query'
import ClippingPageContent from './content'

type PageProps = {
  params: { clippingid: string, userid: string }
  searchParams: { iac: string }
}

async function Page(props: PageProps) {
  const { clippingid, userid } = props.params
  const cid = ~~clippingid
  const clippingsResponse = await client.query<FetchClippingQuery, FetchClippingQueryVariables>({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid,
    },
  })

  const bookID = clippingsResponse.data.clipping.bookID
  if (bookID && bookID.length > 3) {
    await reactQueryClient.prefetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      cacheTime: duration3Days,
    })
  }

  const d = dehydrate(reactQueryClient)

  return (
    <Hydrate state={d}>
      <ClippingPageContent
        cid={cid}
        clipping={clippingsResponse.data}
        iac={props.searchParams.iac}
      />
    </Hydrate>
  )
}

export default Page
