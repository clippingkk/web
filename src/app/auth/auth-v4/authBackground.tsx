import React from 'react'
import { PublicDataQuery } from '../../../schema/generated'
import { duration3Days } from '../../../hooks/book'
import ClippingLite from '../../../components/clipping-item/clipping-lite'
import InfiniteLooper from '../../../components/infinite-looper/infinite-looper';
import BookCover from '../../../components/book-cover/book-cover'
import { WenquSearchResponse, wenquRequest } from '../../../services/wenqu';
import { getReactQueryClient } from '../../../services/ajax';

type AuthBackgroundViewProps = {
  publicData?: PublicDataQuery
}

async function AuthBackgroundView(props: AuthBackgroundViewProps) {
  const { publicData: data } = props
  const dbIds = data?.
    public.
    books.
    map(x => x.doubanId).
    filter(x => x.length > 3) ?? []

  const cs = data?.public.clippings.reduce<PublicDataQuery['public']['clippings'][]>((acc, c, i) => {
    if (i % 2 === 0) {
      acc[0].push(c)
    } else {
      acc[1].push(c)
    }
    return acc
  }, [[], []]) ?? [[], []]

  const rq = getReactQueryClient()
  const bs = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'dbIds', dbIds],
    queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbIds=${dbIds.join('&dbIds=')}`),
    staleTime: duration3Days,
    gcTime: duration3Days,
  })

  return (
    <div className='w-full h-full min-h-screen with-fade-in'>
      <div className='w-full py-10 flex flex-col gap-10'>
        {cs.length === 2 && (
          <InfiniteLooper speed={40} direction="right" key={0}>
            {cs[0].map(c => (
              <div className='w-96 mx-2' key={c.id}>
                <ClippingLite clipping={c} />
              </div>
            ))}
          </InfiniteLooper>
        )}
        <InfiniteLooper speed={80} direction="left" key={1}>
          {bs.books.map(b => (
            <div className='w-96 mx-2' key={b.id}>
              <BookCover book={b} domain='' />
            </div>
          ))}
        </InfiniteLooper>
        {cs.length === 2 && (
          <InfiniteLooper speed={40} direction="right" key={2}>
            {cs[1].map(c => (
              <div className='w-96 mx-2' key={c.id}>
                <ClippingLite clipping={c} />
              </div>
            ))}
          </InfiniteLooper>
        )}
      </div>
    </div>
  )
}

export default AuthBackgroundView
