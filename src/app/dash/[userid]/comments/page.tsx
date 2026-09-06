import { MessageSquare } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/ui/page-header/page-header'
import {
  GetCommentListDocument,
  type GetCommentListQuery,
  type GetCommentListQueryVariables,
} from '@/gql/graphql'
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
      headers: {},
    },
  })

  if (!data?.getCommentList) {
    notFound()
  }

  return (
    <section className="anna-fade-in w-full">
      <PageHeader
        icon={<MessageSquare className="h-5 w-5" />}
        title="My Comments"
        description="View and manage all your comments and discussions"
      />
      <CommentsList initialData={data.getCommentList} userId={uid} />
    </section>
  )
}
