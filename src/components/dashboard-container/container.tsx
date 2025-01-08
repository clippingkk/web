import React from 'react'
import NavigationBar from '../navigation-bar/navigation-bar'
import Footer from '../footer/Footer'

// import { useAtomValue } from 'jotai'
// import { appBackgroundAtom } from '../../store/global'
import { ProfileQuery, ProfileQueryVariables, ProfileDocument } from '@/schema/generated'
import { cookies } from 'next/headers'
import { USER_TOKEN_KEY } from '../../constants/storage'
import { getApolloServerClient } from '../../services/apollo.server'
import { redirect } from 'next/navigation'

type DashboardContainerProps = {
  uidOrDomain?: number | string
  header?: React.ReactNode
  children?: React.ReactNode
}

async function DashboardContainer(props: DashboardContainerProps) {
  const { uidOrDomain, header, children } = props
  const ck = await cookies()
  const token = ck.get(USER_TOKEN_KEY)
  // const bg = useAtomValue(appBackgroundAtom)

  const isUidType = !Number.isNaN(parseInt(props.uidOrDomain as string))

  if (!props.uidOrDomain) {
    return redirect('/')
  }

  const ac = getApolloServerClient()

  const { data: myProfile } = await ac.query<ProfileQuery, ProfileQueryVariables>({

    query: ProfileDocument,
    variables: {
      id: isUidType ? ~~uidOrDomain! : undefined,
      domain: isUidType ? undefined : String(uidOrDomain)
    },
    context: {
      headers: token ? {
        Authorization: 'Bearer ' + token.value
      } : null
    }
  })

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
    <section className={'min-h-screen w-full flex flex-col anna-page-container bg-no-repeat bg-cover'}>
      <div className=' min-h-screen w-full flex flex-col  backdrop-blur-xl bg-gray-400 dark:bg-gray-900 dark:bg-opacity-80 bg-opacity-60'>
        {header ?? <NavigationBar myProfile={myProfile?.me} />}
        <div className=' container flex-col flex m-auto'>
          {children}
        </div>
        <Footer />
      </div>
    </section>
  )
}

export default DashboardContainer
