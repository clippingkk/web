import React, { useEffect, useState } from 'react'
import { Link, navigate } from '@reach/router'
import ListFooter from '../../components/list-footer/list-footer';
import homeListQuery from '../../schema/books.graphql'
import { useQuery } from '@apollo/client';
import { books, booksVariables } from '../../schema/__generated__/books';
import { useSelector } from 'react-redux';
import { TGlobalStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { useMultipBook } from '../../hooks/book';
import NoContentAlert from './no-content';
import BookCover from '../../components/book-cover/book-cover';
import ReadingBook from './reading-book';
import { UserContent } from '../../store/user/type';
const styles = require('./home.css').default

type THomeProp = {
  userid: number
}
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

function HomePage(props: THomeProp) {
  const userProfile = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const uid = userProfile.id
  useUserNewbie(userProfile, () => {
    // is new bie
    navigate(`/dash/${uid}/profile?with_profile_editor=1`)
  })

  const [reachEnd, setReachEnd] = useState(false)
  const { data, fetchMore, loading, called } = useQuery<books, booksVariables>(homeListQuery, {
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
    return (
      <div>loading</div>
    )
  }

  return (
    <section className={`${styles.home} page`}>
      {data.me.recents.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-center font-light text-black text-3xl dark:text-gray-200'>{t('app.home.reading')}</h2>
          <ReadingBook clipping={data.me.recents[0]} uid={uid} />
        </div>
      )}
      <header className='flex items-center justify-center my-10'>
        <h2 className='text-center font-light text-black text-3xl dark:text-gray-200'>{t('app.home.title')}</h2>
        <Link
          to={`/dash/${uid}/unchecked`}
          className='bg-blue-400 duration-300 inline-block py-2 px-4 ml-2 transition-colors hover:bg-blue-700'
        >{t('app.home.unchecked')}</Link>
      </header>

      <div className={styles.clippings}>
        {loading && (
          <div className='my-12 mx-6'>
            loading
          </div>
        )}
        {data.books.length === 0 && called && (
          <NoContentAlert userid={props.userid} />
        )}
        {(books.books.length > 0 && called) &&
          books.books.map((item, index) => (
            <BookCover book={item} userid={props.userid} key={index} />
          ))}
      </div>

      <ListFooter
        loadMoreFn={() => {
          if (loading || !called || books.loading) {
            return
          }
          fetchMore({
            variables: {
              pagination: {
                limit: 10,
                offset: data.books.length
              }
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult || fetchMoreResult.books.length === 0) {
                setReachEnd(true)
                return prev
              }
              return {
                ...prev,
                books: [...prev.books, ...fetchMoreResult.books] as any
              }
            }
          })
        }}
        hasMore={!reachEnd}
      />
    </section>
  )

}

export default HomePage
