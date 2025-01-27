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

type PageProps = {
  params: Promise<{ userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const pathUid: string = (await props.params).userid
  const uid = parseInt(pathUid)
  const client = getApolloServerClient()
  const profileResponse = await client.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: Number.isNaN(uid) ? -1 : uid,
      domain: Number.isNaN(uid) ? pathUid : null
    },
  })
  return profileGenerateMetadata({
    profile: profileResponse.data.me
  })
}

// the home page only available for myself
async function Page(props: PageProps) {
  const { userid } = (await props.params)
  const cs = await cookies()
  const myUid = cs.get('uid')?.value

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
        'Authorization': 'Bearer ' + cs.get('token')?.value
      },
    }
  })
  const { data: booksResponse } = await apolloClient.query<BooksQuery, BooksQueryVariables>({
    query: BooksDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt,
      pagination: {
        limit: 3,
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
          <h2 className='text-center font-light text-black text-3xl dark:text-gray-200'>
            {t('app.home.reading')}
          </h2>
          <ReadingBook
            book={firstBook}
            clipping={recents?.[0]}
            uid={myUidInt!} />
        </div>
      )}
      <header className='flex items-center justify-center my-10'>
        <h2 className='text-center font-light text-black text-3xl dark:text-gray-200'>{t('app.home.title')}</h2>
        <Link
          href={`/dash/${myUidInt}/unchecked`}
          className='bg-blue-400 duration-300 inline-block py-2 px-4 ml-2 transition-all hover:bg-blue-700 rounded hover:shadow'>

          {t('app.home.unchecked')}
        </Link>
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
