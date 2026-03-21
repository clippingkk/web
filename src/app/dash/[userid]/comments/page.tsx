import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import { COOKIE_TOKEN_KEY } from '@/constants/storage'
import {
  GetCommentListDocument,
  type GetCommentListQuery,
  type GetCommentListQueryVariables,
} from '@/schema/generated'
import { doApolloServerQuery } from '@/services/apollo.server'

import CommentsList from './comments-list'

type Props = {
  params: Promise<{
    userid: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userid } = await params

  return {
    title: `Comments - User ${userid}`,
    description: 'View all comments and discussions',
  }
}

export default async function CommentsPage({ params }: Props) {
  const { userid } = await params
  const uid = parseInt(userid, 10)

  if (Number.isNaN(uid)) {
    notFound()
  }

  const ck = await cookies()
  const token = ck.get(COOKIE_TOKEN_KEY)?.value

  const { data } = await doApolloServerQuery<
    GetCommentListQuery,
    GetCommentListQueryVariables
  >({
    query: GetCommentListDocument,
    variables: {
      uid,
      pagination: {
        limit: 20,
      },
    },
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  })

  if (!data?.getCommentList) {
    notFound()
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            My Comments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your comments and discussions
          </p>
        </div>

        {/* Comments List */}
        <CommentsList initialData={data.getCommentList} userId={uid} />
      </div>
    </div>
  )
}
