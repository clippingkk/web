import { ChevronLeft, Crown, Home } from 'lucide-react'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '@/constants/storage'
import type { ProfileQuery, ProfileQueryVariables } from '@/gql/graphql'
import { getTranslation } from '@/i18n'
import { doApolloServerQuery } from '@/services/apollo.server'
import logo from '../../assets/logo.png'
import { ProfileDocument } from '../../schema/generated'
import { getMyHomeLink } from '../../utils/profile.utils'
import LinkIndicator from '../link-indicator'
import UserName from '../profile/user-name'

type NavigateGuideProps = {
  title?: string
  uid?: number
}

async function NavigateGuide(props: NavigateGuideProps) {
  const { t } = await getTranslation()
  const ck = await cookies()
  const uid = ck.get(USER_ID_KEY)?.value
  const tk = ck.get(COOKIE_TOKEN_KEY)?.value

  const pid = props.uid ?? 0
  let p: ProfileQuery['me'] | null = null
  if (uid && tk) {
    const { data } = await doApolloServerQuery<
      ProfileQuery,
      ProfileQueryVariables
    >({
      query: ProfileDocument,
      variables: {
        id: pid,
      },
      context: {
        headers: {
          Authorization: `Bearer ${tk}`,
        },
      },
    })
    p = data.me
  }

  return (
    <nav className='with-slide-in sticky top-0 z-30 w-full bg-gradient-to-r from-purple-700/50 to-pink-600/50 shadow-xl backdrop-blur-xl dark:from-purple-900/70 dark:to-pink-800/70'>
      <div className='container mx-auto px-4 py-3 md:py-4'>
        <div className='flex items-center justify-between'>
          {/* Left side with back button and title */}
          <div className='flex items-center gap-3 text-white'>
            <Link
              href='/'
              className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20'
              aria-label={t('common.back')}
            >
              <LinkIndicator>
                <ChevronLeft className='h-5 w-5' />
              </LinkIndicator>
            </Link>
            <div className='flex items-center gap-2'>
              <Crown className='h-5 w-5 text-yellow-300' />
              <h1 className='text-xl font-bold tracking-tight'>
                {props.title}
              </h1>
            </div>
          </div>

          {/* Right side with user or logo */}
          <div className='flex items-center'>
            {p ? (
              <Link
                href={getMyHomeLink(p) as any}
                className='flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 transition-colors duration-200 hover:bg-white/20'
              >
                <UserName name={p.name} premiumEndAt={p.premiumEndAt} />
              </Link>
            ) : (
              <div className='flex gap-3'>
                <Link
                  href='/'
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20'
                  aria-label='Home'
                >
                  <Home className='h-5 w-5 text-white' />
                </Link>
                <Link href='/' className='flex items-center gap-2'>
                  <div className='relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10'>
                    <Image
                      src={logo}
                      alt='ClippingKK logo'
                      className='h-8 w-8 object-contain'
                      width={32}
                      height={32}
                      priority
                    />
                  </div>
                  <span className='hidden text-xl font-bold text-white sm:inline-block'>
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
