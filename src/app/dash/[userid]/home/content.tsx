'use client'
import React, { useEffect, useState } from 'react'
import ListFooter from '@/components/list-footer/list-footer'
import { useMultipleBook } from '@/hooks/book'
import BookCover from '@/components/book-cover/book-cover'
import { UserContent } from '@/store/user/type'
import { useSyncClippingsToServer } from '@/hooks/my-file'
import { useRouter } from 'next/navigation'
import { BooksSkeleton } from './skeleton'
import { BooksDocument, BooksQuery, BooksQueryVariables, ProfileDocument, ProfileQuery, ProfileQueryVariables } from '@/schema/generated'
import { useQuery, useSuspenseQuery } from '@apollo/client'

const STEP = 10

function useUserNewbie(userProfile: UserContent | null, onNewbie: () => void) {
  useEffect(() => {
    if (!userProfile || userProfile.id === 0) {
      return
    }
    const sp = new URLSearchParams(location.search)
    if (
      userProfile.avatar === '' &&
      userProfile.bio === '' &&
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
}

function HomePageContent(props: HomePageContentProps) {
  const { userid: userDomain, myUid } = props
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

  const books = useMultipleBook(bls)

  return (
    <>
      <div className='flex flex-wrap items-center justify-center'>
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
    </>
  )
}

export default HomePageContent
