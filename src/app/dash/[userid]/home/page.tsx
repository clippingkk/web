import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AIBookRecommendationButton from '@/components/book-recommendation/ai-book-recommendation-button'
import { generateMetadata as profileGenerateMetadata } from '@/components/og/og-with-user-profile'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { getTranslation } from '@/i18n'
import {
  BooksDocument,
  type BooksQuery,
  type BooksQueryVariables,
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'

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
      profile: profileResponse.data!.me,
    })
  } catch {
    return profileGenerateMetadata({})
  }
}

// the home page only available for myself
async function Page(props: PageProps) {
  const [params, ck, { t }] = await Promise.all([
    props.params,
    cookies(),
    getTranslation(undefined, 'home'),
  ])
  const { userid } = params
  const myUid = ck.get(USER_ID_KEY)?.value
  const token = ck.get(COOKIE_TOKEN_KEY)?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid, 10) : undefined

  const reqs: [
    ReturnType<typeof doApolloServerQuery<ProfileQuery, ProfileQueryVariables>>,
    ReturnType<typeof doApolloServerQuery<BooksQuery, BooksQueryVariables>>,
    ReturnType<
      typeof doApolloServerQuery<ProfileQuery, ProfileQueryVariables>
    >?,
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

  const recents = profileResponse.data!.me.recents
  const firstBookId =
    recents.length > 0 && (recents[0].bookID?.length ?? 0) > 3
      ? recents[0].bookID!
      : ''

  return (
    <section className="page h-full">
      {firstBookId && (
        <div className="with-slide-in mt-4">
          <h2 className="relative z-10 mb-8 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-center text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            {t('app.home.reading')}
          </h2>
          <ReadingBook
            bookId={firstBookId}
            clipping={recents?.[0]}
            uid={myUidInt!}
          />
        </div>
      )}
      <header className="my-12 flex flex-col items-center justify-center gap-4 md:flex-row">
        <h2 className="relative z-10 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-center text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
          {t('app.home.title')}
        </h2>
        <div className="mt-2 flex items-center gap-3 md:mt-0">
          <Link
            href={`/dash/${myUidInt}/unchecked`}
            className="inline-flex items-center rounded-xl bg-blue-400 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
          >
            {t('app.home.unchecked')}
          </Link>
          <AIBookRecommendationButton
            uid={myUidInt!}
            books={booksResponse.data!.books}
          />
        </div>
      </header>
      {!firstBookId && booksResponse.data!.books.length === 0 && (
        <div className="flex flex-wrap items-center justify-center">
          <NoContentAlert domain={userid} />
        </div>
      )}
      <HomePageContent
        userid={userid}
        myUid={myUidInt}
        targetProfile={
          accessingProfileResponse?.data?.me ?? profileResponse.data!.me
        }
      />
    </section>
  )
}

export default Page
