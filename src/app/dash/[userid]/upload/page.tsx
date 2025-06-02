import { useTranslation } from '@/i18n'
import {
  ProfileDocument,
  ProfileQuery,
  ProfileQueryVariables,
} from '@/schema/generated'
import { getApolloServerClient } from '@/services/apollo.server'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UploaderPageContent from './content'
import ClippingsUploadHelp from './help'

type Props = {
  params: Promise<{ userid: string }>
}

export const metadata: Metadata = {
  title: '同步用户书摘',
}

async function Page(props: Props) {
  const [params, ck, { t }] = await Promise.all([
    props.params,
    cookies(),
    useTranslation(undefined, 'upload'),
  ])
  const { userid } = params
  const myUid = ck.get('uid')?.value

  if (!myUid) {
    return redirect(`/dash/${userid}/profile`)
  }

  const myUidInt = myUid ? parseInt(myUid) : undefined

  const apolloClient = getApolloServerClient()
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
      headers: {
        Authorization: 'Bearer ' + ck.get('token')?.value,
      },
    },
  })
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            {t('app.upload.tip')}
          </h1>
          <p className="text-base text-gray-600 md:text-lg dark:text-gray-400">
            {t('app.upload.private.description') ??
              'Drag and drop your Kindle clippings file to share your favorite passages'}
          </p>
        </div>
        <UploaderPageContent profile={profileResponse.me} />
        <ClippingsUploadHelp />
      </div>
    </section>
  )
}

export default Page
