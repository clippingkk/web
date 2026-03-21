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
    <section
      className={
        'anna-page-container flex min-h-screen w-full flex-col bg-cover bg-no-repeat'
      }
    >
      <div className="dark:bg-opacity-80 bg-opacity-60 flex min-h-screen w-full flex-col bg-gray-400 backdrop-blur-xl dark:bg-gray-900">
        {header ?? <NavigationBar myProfile={myProfile?.me} />}
        <div className="container m-auto flex flex-col">{children}</div>
        <Footer />
      </div>
    </section>
  )
}

export default DashboardContainer
