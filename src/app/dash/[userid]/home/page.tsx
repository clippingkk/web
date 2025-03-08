import React from 'react'
import HomePageContent from './content'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import { Metadata } from 'next'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument, BooksQuery, BooksDocument, BooksQueryVariables } from '@/schema/generated'
import { getApolloServerClient } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getReactQueryClient } from '@/services/ajax'
import { WenquBook, WenquSearchResponse, wenquRequest } from '@/services/wenqu'
import { duration3Days } from '@/hooks/book'
import ReadingBook from './reading-book'
import { useTranslation } from '@/i18n'
import Link from 'next/link'
import NoContentAlert from './no-content'
import AIBookRecommendationButton from '../../../../components/book-recommendation/ai-book-recommendation-button'

type PageProps = {
  params: Promise<{ userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const [ck, params] = await Promise.all([cookies(), props.params])
  const pathUid: string = params.userid
  const uid = parseInt(pathUid)
  const client = getApolloServerClient()

  const tk = ck.get('token')?.value

  try {
    const profileResponse = await client.query<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      fetchPolicy: 'network-only',
      variables: {
        id: Number.isNaN(uid) ? -1 : uid,
        domain: Number.isNaN(uid) ? pathUid : null
      },
      context: tk ? {
        headers: {
          'Authorization': 'Bearer ' + tk,
        },
      } : undefined
    })
    return profileGenerateMetadata({
      profile: profileResponse.data.me
    })
  } catch (e) {
    console.error(e)
    return profileGenerateMetadata({})
  }
}

// the home page only available for myself
async function Page(props: PageProps) {

  const [params, ck] = await Promise.all([props.params, cookies()])
  const { userid } = params
  const myUid = ck.get('uid')?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid) : undefined

  const apolloClient = getApolloServerClient()
  const profileResponse = await apolloClient.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt
    },
    context: {
      headers: {
        'Authorization': 'Bearer ' + ck.get('token')?.value
      },
    }
  })
  const { data: booksResponse } = await apolloClient.query<BooksQuery, BooksQueryVariables>({
    query: BooksDocument,
    fetchPolicy: 'network-only',
    context: {
      headers: {
        'Authorization': 'Bearer ' + ck.get('token')?.value
      },
    },
    variables: {
      id: myUidInt,
      pagination: {
        limit: 10,
        offset: 0
      },
    },
  })

  let firstBook: WenquBook | null = null

  if (profileResponse.data.me.recents.length > 0) {
    let firstBookId = profileResponse.data.me.recents[0].bookID ?? ''
    if (firstBookId.length <= 3) {
      firstBookId = ''
    }
    if (firstBookId) {
      const b = await getReactQueryClient().fetchQuery({
        queryKey: ['wenqu', 'books', firstBookId],
        queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${firstBookId}`),
        staleTime: duration3Days,
        gcTime: duration3Days,
      })
      firstBook = b.books.length > 0 ? b.books[0] : null
    }
  }

  const { t } = await useTranslation()
  const recents = profileResponse.data.me.recents

  return (
    <section className='h-full page'>
      {firstBook && (
        <div className='mt-8 with-slide-in'>
          <h2 className='text-center font-medium tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent text-4xl relative z-10 flex items-center justify-center mb-8'>
            {t('app.home.reading')}
          </h2>
          <ReadingBook
            book={firstBook}
            clipping={recents?.[0]}
            uid={myUidInt!} />
        </div>
      )}
      <header className='flex flex-col md:flex-row items-center justify-center gap-4 my-12'>
        <h2 className='text-center font-medium tracking-tight bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent text-4xl relative z-10'>
          {t('app.home.title')}
        </h2>
        <div className='flex items-center gap-3 mt-4 md:mt-0'>
          <Link
            href={`/dash/${myUidInt}/unchecked`}
            className='group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]'>
            <span className='relative z-10'>{t('app.home.unchecked')}</span>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
          </Link>
          <AIBookRecommendationButton
            uid={myUidInt!}
            books={booksResponse.books}
          />
        </div>
      </header>
      {!firstBook && booksResponse.books.length === 0 && (
        <div className='flex flex-wrap items-center justify-center'>
          <NoContentAlert domain={userid} />
        </div>
      )}
      <HomePageContent userid={userid} myUid={myUidInt} />
    </section>
  )
}

export default Page
