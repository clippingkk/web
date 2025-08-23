import type { ApolloQueryResult } from '@apollo/client/core'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AIBookRecommendationButton from '@/components/book-recommendation/ai-book-recommendation-button'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import {
  BooksDocument,
  type BooksQuery,
  type BooksQueryVariables,
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'
import { duration3Days } from '@/hooks/book'
import { useTranslation } from '@/i18n'
import { getReactQueryClient } from '@/services/ajax'
import { doApolloServerQuery } from '@/services/apollo.server'
import {
  type WenquBook,
  type WenquSearchResponse,
  wenquRequest,
} from '@/services/wenqu'
import HomePageContent from './content'
import NoContentAlert from './no-content'
import ReadingBook from './reading-book'

type PageProps = {
  params: Promise<{ userid: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const [ck, params] = await Promise.all([cookies(), props.params])
  const pathUid: string = params.userid
  const uid = parseInt(pathUid, 10)
  const tk = ck.get(COOKIE_TOKEN_KEY)?.value

  if (!tk) {
    return profileGenerateMetadata({})
  }

  try {
    const profileResponse = await doApolloServerQuery<
      ProfileQuery,
      ProfileQueryVariables
    >({
      query: ProfileDocument,
      fetchPolicy: 'network-only',
      variables: {
        id: Number.isNaN(uid) ? -1 : uid,
        domain: Number.isNaN(uid) ? pathUid : null,
      },
      context: {
        headers: {
          Authorization: `Bearer ${tk}`,
        },
      },
    })
    return profileGenerateMetadata({
      profile: profileResponse.data?.me ?? undefined,
    })
  } catch (e) {
    console.error(e)
    return profileGenerateMetadata({})
  }
}

// the home page only available for myself
async function Page(props: PageProps) {
  const [params, ck, { t }] = await Promise.all([
    props.params,
    cookies(),
    useTranslation(undefined, 'home'),
  ])
  const { userid } = params
  const myUid = ck.get(USER_ID_KEY)?.value
  const token = ck.get(COOKIE_TOKEN_KEY)?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid, 10) : undefined

  const reqs: [
    Promise<ApolloQueryResult<ProfileQuery>>,
    Promise<ApolloQueryResult<BooksQuery>>,
    Promise<ApolloQueryResult<ProfileQuery>>?,
  ] = [
    doApolloServerQuery<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      fetchPolicy: 'network-only',
      variables: {
        id: myUidInt,
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }),
    doApolloServerQuery<BooksQuery, BooksQueryVariables>({
      query: BooksDocument,
      fetchPolicy: 'network-only',
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      variables: {
        id: myUidInt,
        pagination: {
          limit: 10,
          offset: 0,
        },
      },
    }),
  ]

  if (myUid !== userid) {
    reqs.push(
      doApolloServerQuery<ProfileQuery, ProfileQueryVariables>({
        query: ProfileDocument,
        fetchPolicy: 'network-only',
        variables: {
          id: Number.isNaN(userid) ? undefined : Number(userid),
          domain: Number.isNaN(userid) ? userid : undefined,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
    )
  }

  const [profileResponse, booksResponse, accessingProfileResponse] =
    await Promise.all(reqs)

  let firstBook: WenquBook | null = null

  if (
    profileResponse.data?.me?.recents &&
    profileResponse.data.me.recents.length > 0
  ) {
    let firstBookId = profileResponse.data.me.recents[0].bookID ?? ''
    if (firstBookId.length <= 3) {
      firstBookId = ''
    }
    if (firstBookId) {
      const b = await getReactQueryClient().fetchQuery({
        queryKey: ['wenqu', 'books', firstBookId],
        queryFn: () =>
          wenquRequest<WenquSearchResponse>(
            `/books/search?dbId=${firstBookId}`
          ),
        staleTime: duration3Days,
        gcTime: duration3Days,
      })
      firstBook = b.books.length > 0 ? b.books[0] : null
    }
  }

  const recents = profileResponse.data?.me?.recents ?? []

  return (
    <section className='page h-full'>
      {firstBook && (
        <div className='with-slide-in mt-8'>
          <h2 className='relative z-10 mb-8 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent'>
            {t('app.home.reading')}
          </h2>
          <ReadingBook
            book={firstBook}
            clipping={recents?.[0]}
            uid={myUidInt!}
          />
        </div>
      )}
      <header className='my-12 flex flex-col items-center justify-center gap-4 md:flex-row'>
        <h2 className='relative z-10 bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent'>
          {t('app.home.title')}
        </h2>
        <div className='mt-4 flex items-center gap-3 md:mt-0'>
          <Link
            href={`/dash/${myUidInt}/unchecked`}
            className='group relative overflow-hidden rounded-md bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 font-medium text-white shadow-md transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg'
          >
            <span className='relative z-10'>{t('app.home.unchecked')}</span>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
          </Link>
          <AIBookRecommendationButton
            uid={myUidInt!}
            books={booksResponse.data?.books ?? []}
          />
        </div>
      </header>
      {!firstBook && (booksResponse.data?.books?.length ?? 0) === 0 && (
        <div className='flex flex-wrap items-center justify-center'>
          <NoContentAlert domain={userid} />
        </div>
      )}
      {(accessingProfileResponse?.data?.me || profileResponse.data?.me) && (
        <HomePageContent
          userid={userid}
          myUid={myUidInt}
          targetProfile={
            (accessingProfileResponse?.data?.me ?? profileResponse.data?.me)!
          }
        />
      )}
    </section>
  )
}

export default Page
