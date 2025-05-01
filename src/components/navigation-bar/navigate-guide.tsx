import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ChevronLeft, Home, Crown } from 'lucide-react'
import logo from '../../assets/logo.png'
import { ProfileDocument } from '../../schema/generated'
import UserName from '../profile/user-name'
import { getMyHomeLink } from '../../utils/profile.utils'
import { doApolloServerQuery } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import { ProfileQuery, ProfileQueryVariables } from '@/gql/graphql'
import { useTranslation } from '@/i18n'
import LinkIndicator from '../link-indicator'

type NavigateGuideProps = {
  title?: string
  uid?: number
}

async function NavigateGuide(props: NavigateGuideProps) {
  const { t } = await useTranslation()
  const ck = await cookies()
  const uid = ck.get('uid')?.value
  const tk = ck.get('token')?.value

  const pid = props.uid ?? 0
  let p: ProfileQuery['me'] | null = null
  if (uid && tk) {
    const { data } = await doApolloServerQuery<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      variables: {
        id: pid
      },
      context: {
        headers: {
          'Authorization': 'Bearer ' + tk,
        },
      },
    })
    p = data.me
  }

  return (
    <nav className="sticky top-0 z-30 w-full bg-gradient-to-r from-purple-700/50 to-pink-600/50 dark:from-purple-900/70 dark:to-pink-800/70 backdrop-blur-xl shadow-xl with-slide-in">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left side with back button and title */}
          <div className="flex items-center gap-3 text-white">
            <Link 
              href="/" 
              className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              aria-label={t('common.back')}
            >
              <LinkIndicator>
                <ChevronLeft className="w-5 h-5" />
              </LinkIndicator>
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-300" />
              <h1 className="text-xl font-bold tracking-tight">{props.title}</h1>
            </div>
          </div>

          {/* Right side with user or logo */}
          <div className="flex items-center">
            {p ? (
              <Link 
                href={getMyHomeLink(p)} 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <UserName
                  name={p.name}
                  premiumEndAt={p.premiumEndAt}
                />
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link 
                  href="/" 
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  aria-label="Home"
                >
                  <Home className="w-5 h-5 text-white" />
                </Link>
                <Link href="/" className="flex items-center gap-2">
                  <div className="relative overflow-hidden rounded-full bg-white/10 w-10 h-10 flex items-center justify-center">
                    <Image
                      src={logo}
                      alt="ClippingKK logo"
                      className="w-8 h-8 object-contain"
                      width={32}
                      height={32}
                      priority
                    />
                  </div>
                  <span className="text-xl font-bold text-white hidden sm:inline-block">
                    ClippingKK
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavigateGuide
