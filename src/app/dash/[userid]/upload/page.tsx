import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { currentUserId } from '@/server/gate/current'
import { getApolloServerClient } from '@/services/apollo.server'

import UploaderPageContent from './content'
import ClippingsUploadHelp from './help'

type Props = {
  params: Promise<{ userid: string }>
}

export const metadata: Metadata = {
  title: '同步用户书摘',
}

async function Page(props: Props) {
  const [params, { t }] = await Promise.all([
    props.params,
    getTranslation(undefined, 'upload'),
  ])
  const { userid } = params
  const myUid = (await currentUserId())?.toString()

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid, 10) : undefined

  const apolloClient = await getApolloServerClient()
  const { data: profileResponse } = await apolloClient.query<
    ProfileQuery,
    ProfileQueryVariables
  >({
    query: ProfileDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: myUidInt,
    },
    context: {
      headers: {},
    },
  })
  return (
    <section className="with-slide-in w-full py-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            {t('app.upload.tip')}
          </h1>
          <p className="text-base text-slate-600 md:text-lg dark:text-slate-300">
            {t('app.upload.private.description') ??
              'Drag and drop your Kindle clippings file to share your favorite passages'}
          </p>
        </div>
        <UploaderPageContent profile={profileResponse!.me} />
        <ClippingsUploadHelp />
      </div>
    </section>
  )
}

export default Page
