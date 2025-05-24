import { useTranslation } from '@/i18n'
import { Users } from 'lucide-react'
import Image from 'next/image'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { User } from '../../schema/generated'
import HideUntilLoaded from '../SimpleAnimation/HideUntilLoaded'
import styles from './tops.module.css'

type TopUsersProps = {
  users?: Pick<User, 'id' | 'avatar' | 'name'>[]
}

async function TopUsers(props: TopUsersProps) {
  const { t } = await useTranslation()
  if (!props.users) {
    return null
  }
  const users = props.users
    .filter((x) => x.avatar && x.avatar !== 'null')
    .map((x) => ({
      ...x,
      avatar: x.avatar.startsWith('http')
        ? x.avatar
        : `${CDN_DEFAULT_DOMAIN}/${x.avatar}`,
    }))
  return (
    <div className="relative overflow-hidden px-4 py-20 sm:px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-10 left-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/5 to-cyan-400/10 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tl from-purple-500/5 to-blue-400/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center">
          {/* Section Title with gradient */}
          <div className="mb-4 flex items-center gap-3">
            <Users size={30} className="text-blue-500" />
            <h2 className="font-lato bg-gradient-to-r from-blue-500 via-purple-400 to-blue-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl">
              {t('app.public.readers')}
            </h2>
          </div>

          {/* Subtitle with improved styling */}
          <p className="text-center text-slate-600 italic dark:text-slate-300">
            {t('app.public.hideReasons')}
          </p>

          {/* Decorative line */}
          <div className="mt-4 mb-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-400" />
        </div>

        {/* Users grid with improved styling */}
        <div className="relative">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {users.length === 0 ? (
              <li className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                <p>{t('app.no.users') || 'No users found'}</p>
              </li>
            ) : (
              users.map((u) => (
                <li key={u.id} className="group flex flex-col items-center">
                  <HideUntilLoaded imageToLoad={u.avatar}>
                    <div
                      className={`relative flex flex-col items-center justify-center ${styles['user-item']}`}
                    >
                      {/* Avatar with enhanced styling */}
                      <div className="relative mb-3 overflow-hidden rounded-full transition-all duration-300 group-hover:scale-105">
                        {/* Glow effect behind avatar */}
                        <div className="absolute -inset-1 scale-0 rounded-full bg-gradient-to-r from-blue-500/40 to-purple-500/40 opacity-0 blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />

                        <Image
                          src={u.avatar}
                          className="relative h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-lg"
                          height={80}
                          width={80}
                          alt={u.name}
                          loading="lazy"
                        />
                      </div>

                      {/* Name with transition effect */}
                      <span
                        className={`mt-2 max-w-full truncate text-center font-medium text-slate-700 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-slate-200 ${styles['user-name']}`}
                      >
                        {u.name}
                      </span>
                    </div>
                  </HideUntilLoaded>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TopUsers
