import { ServerError } from '@apollo/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type React from 'react'

import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/schema/generated'

import { COOKIE_TOKEN_KEY } from '../../constants/storage'
import { doApolloServerQuery } from '../../services/apollo.server'
import Footer from '../footer/Footer'
import NavigationBar from '../navigation-bar/navigation-bar'
import DecorBlobs from '../ui/decor-blobs/decor-blobs'

type DashboardContainerProps = {
  uidOrDomain?: number | string
  header?: React.ReactNode
  children?: React.ReactNode
}

async function DashboardContainer(props: DashboardContainerProps) {
  const { uidOrDomain, header, children } = props
  const ck = await cookies()
  const token = ck.get(COOKIE_TOKEN_KEY)

  const isUidType = !Number.isNaN(parseInt(props.uidOrDomain as string, 10))

  let myProfile: ProfileQuery | null = null

  if (uidOrDomain) {
    try {
      const { data } = await doApolloServerQuery<
        ProfileQuery,
        ProfileQueryVariables
      >({
        query: ProfileDocument,
        variables: {
          id: isUidType ? ~~uidOrDomain! : undefined,
          domain: isUidType ? undefined : String(uidOrDomain),
        },
        context: {
          headers: token
            ? {
                Authorization: `Bearer ${token.value}`,
              }
            : null,
        },
      })
      myProfile = data
    } catch (e) {
      if (e instanceof ServerError) {
        const statusCode = e.statusCode
        if (statusCode === 401) {
          return redirect('/auth/auth-v4?clean=true')
        }
        // user not found. maybe need to login again
        if (statusCode === 404) {
          return redirect('/auth/auth-v4?clean=true')
        }
      }
      throw e
    }
  }

  return (
    <section className="anna-page-container relative flex min-h-screen w-full flex-col overflow-hidden">
      <DecorBlobs />
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        {header ?? <NavigationBar myProfile={myProfile?.me} />}
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-6 md:py-10">
          {children}
        </main>
        <Footer />
      </div>
    </section>
  )
}

export default DashboardContainer
