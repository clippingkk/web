'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ListFooter from '@/components/list-footer/list-footer';
import { useTranslation } from 'react-i18next';
import { useMultipleBook } from '@/hooks/book';
import NoContentAlert from './no-content';
import BookCover from '@/components/book-cover/book-cover';
import ReadingBook from './reading-book';
import { UserContent } from '@/store/user/type';
import { useSyncClippingsToServer } from '@/hooks/my-file'
import { useRouter } from 'next/navigation';
import HomePageSkeleton, { BooksSkeleton } from './skeleton';
import { BooksDocument, BooksQuery, BooksQueryVariables, ProfileDocument, ProfileQuery, ProfileQueryVariables } from '@/schema/generated';
import { useQuery, useSuspenseQuery } from '@apollo/client'

const STEP = 10

function useUserNewbie(userProfile: UserContent | null, onNewbie: () => void) {
  useEffect(() => {
    if (!userProfile || userProfile.id === 0) {
      return
    }
    const sp = new URLSearchParams(location.search)
    if (
      userProfile.avatar === "" &&
      userProfile.bio === "" &&
      userProfile.name.startsWith('user.') &&
      userProfile.createdAt === userProfile.updatedAt &&
      sp.has('from_auth')
    ) {
      // is newbie
      onNewbie()
    }
    // 正常用户，redirect to home page
  }, [userProfile])
}

type HomePageContentProps = {
  userid: string
  myUid?: number
  firstBookId?: string
}

function HomePageContent(props: HomePageContentProps) {
  const { userid: userDomain, myUid, firstBookId } = props
  const isTypeUid = !Number.isNaN(parseInt(userDomain))
  const { data: targetProfileData } = useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, {
    variables: {
      id: isTypeUid ? ~~userDomain : undefined,
      domain: isTypeUid ? undefined : userDomain
    }
  })

  const { data: myProfile } = useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, {
    variables: {
      id: myUid
    }
  })

  const userProfile = targetProfileData.me
  const uid = myProfile.me.id

  const { push: navigate } = useRouter()

  // only works for me(logged user is same with the accessing user)
  useUserNewbie(userProfile.id === uid ? userProfile : null, () => {
    // is new bie
    navigate(`/dash/${uid}/profile?with_profile_editor=1`)
  })
  useSyncClippingsToServer(uid)

  const [reachEnd, setReachEnd] = useState(false)
  const { data, fetchMore } = useQuery<BooksQuery, BooksQueryVariables>(BooksDocument, {
    variables: {
      id: targetProfileData.me.id,
      pagination: {
        limit: STEP,
        offset: 0
      },
    },
  })

  const bls = data?.books.map(x => x.doubanId) ?? []

  const { t } = useTranslation()
  const books = useMultipleBook(bls)

  const recents = data?.me.recents ?? []

  return (
    <section className='h-full page'>
      {firstBookId && firstBookId.length > 3 && (
        <div className='mt-8 with-slide-in'>
          <h2 className='text-center font-light text-black text-3xl dark:text-gray-200'>
            {t('app.home.reading')}
          </h2>
          <ReadingBook
            bookId={firstBookId}
            clipping={recents?.[0]}
            uid={uid} />
        </div>
      )}
      <header className='flex items-center justify-center my-10'>
        <h2 className='text-center font-light text-black text-3xl dark:text-gray-200'>{t('app.home.title')}</h2>
        <Link
          href={`/dash/${uid}/unchecked`}
          className='bg-blue-400 duration-300 inline-block py-2 px-4 ml-2 transition-all hover:bg-blue-700 rounded hover:shadow'>

          {t('app.home.unchecked')}
        </Link>
      </header>

      <div className='flex flex-wrap items-center justify-center'>
        {((data?.books.length ?? 0) === 0 && !firstBookId) && (
          <NoContentAlert domain={userDomain} />
        )}
        {(books.books.length > 0) &&
          books.books.map((item, index) => (
            <BookCover
              book={item}
              key={index}
              domain={userDomain}
            />
          ))}
      </div>

      <ListFooter
        loadingBlock={
          <div className='w-full'>
            <BooksSkeleton />
          </div>
        }
        loadMoreFn={() => {
          fetchMore({
            variables: {
              id: uid,
              pagination: {
                limit: STEP,
                offset: bls.length
              }
            },
          }).then((res) => {
            if (res.data.books.length < STEP) {
              setReachEnd(true)
            }
          })
        }}
        hasMore={!reachEnd}
      />
    </section>
  );
}

export default HomePageContent
