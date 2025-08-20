import { ApolloError } from '@apollo/client'
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

  const isUidType = !Number.isNaN(parseInt(props.uidOrDomain as string))

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
                Authorization: 'Bearer ' + token.value,
              }
            : null,
        },
      })
      myProfile = data
    } catch (e) {
      if (e instanceof ApolloError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (e.networkError as any)?.statusCode as number
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

  // const containerStyle = useMemo<React.CSSProperties | undefined>(() => {
  //   if (!bg) {
  //     return undefined
  //   }
  //   return {
  //     // backgroundImage: `url(https://picsum.photos/${width}/${height}/?blur=10)`
  //     backgroundImage: `url(${bg})`,
  //   }
  // }, [])
  // TODO: 预处理
  // https://lokeshdhakar.com/projects/color-thief/#getting-started
  // + dark theme or light theme
  return (
    <section
      className={
        'min-h-screen w-full flex flex-col anna-page-container bg-no-repeat bg-cover'
      }
    >
      <div className=" min-h-screen w-full flex flex-col  backdrop-blur-xl bg-gray-400 dark:bg-gray-900 dark:bg-opacity-80 bg-opacity-60">
        {header ?? <NavigationBar myProfile={myProfile?.me} />}
        <div className=" container flex-col flex m-auto">{children}</div>
        <Footer />
      </div>
    </section>
  )
}

export default DashboardContainer
