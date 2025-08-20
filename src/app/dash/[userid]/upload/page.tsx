import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import { useTranslation } from '@/i18n'
import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/schema/generated'
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
  const [params, ck, { t }] = await Promise.all([
    props.params,
    cookies(),
    useTranslation(undefined, 'upload'),
  ])
  const { userid } = params
  const myUid = ck.get(USER_ID_KEY)?.value

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
        Authorization: 'Bearer ' + ck.get(COOKIE_TOKEN_KEY)?.value,
      },
    },
  })
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-sky-400 via-violet-500 to-fuchsia-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            {t('app.upload.tip')}
          </h1>
          <p className="bg-gradient-to-r from-sky-400 via-violet-500 to-fuchsia-500 bg-clip-text text-base text-transparent md:text-lg">
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
