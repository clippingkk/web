'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ListFooter from '../../../../components/list-footer/list-footer';
import { useSelector } from 'react-redux';
import { TGlobalStore } from '../../../../store';
import { useTranslation } from 'react-i18next';
import { useMultipBook } from '../../../../hooks/book';
import NoContentAlert from './no-content';
import BookCover from '../../../../components/book-cover/book-cover';
import ReadingBook from './reading-book';
import { UserContent } from '../../../../store/user/type';
import { useSyncClippingsToServer } from '../../../../hooks/my-file'
import { useRouter } from 'next/navigation';
import HomePageSkeleton from './skeleton';
import { useBooksQuery } from '../../../../schema/generated';

const STEP = 10

function useUserNewbie(userProfile: UserContent, onNewbie: () => void) {
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
}

function HomePageContent(props: HomePageContentProps) {
  const { userid: userDomain } = props
  const userProfile = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const uid = userProfile.id

  const { push: navigate } = useRouter()

  useUserNewbie(userProfile, () => {
    // is new bie
    navigate(`/dash/${uid}/profile?with_profile_editor=1`)
  })
  useSyncClippingsToServer()

  const [reachEnd, setReachEnd] = useState(false)
  const { data, fetchMore, loading, called } = useBooksQuery({
    variables: {
      id: uid,
      pagination: {
        limit: STEP,
        offset: 0
      },
    },
    skip: !uid,
  })
  const { t } = useTranslation()
  const books = useMultipBook(data?.books.map(x => x.doubanId) || [])

  if (!data) {
    return (<HomePageSkeleton />)
  }

  return (
    <section className='h-full page'>
      {data.me.recents.length > 0 && (
        <div className='mt-8 with-slide-in'>
          <h2 className='text-center font-light text-black text-3xl dark:text-gray-200'>
            {t('app.home.reading')}
          </h2>
          <ReadingBook clipping={data.me.recents[0]} uid={uid} />
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
        {loading && (
          <div className='my-12 mx-6'>
            loading
          </div>
        )}
        {data.books.length === 0 && called && (
          <NoContentAlert domain={userDomain} />
        )}
        {(books.books.length > 0 && called) &&
          books.books.map((item, index) => (
            <BookCover
              book={item}
              key={index}
              domain={userDomain}
            />
          ))}
      </div>

      <ListFooter
        loadMoreFn={() => {
          if (loading || !called || books.loading) {
            return
          }
          fetchMore({
            variables: {
              id: uid,
              pagination: {
                limit: 10,
                offset: data.books.length
              }
            },
          }).then(res => {
            if (res.data.books.length === 0) {
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
