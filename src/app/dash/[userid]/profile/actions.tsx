'use client'
import { UserMinus, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'
import {
  type ProfileQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/schema/generated'
import { toastPromiseDefaultOption } from '@/services/misc'

type Props = {
  isInMyPage: boolean
  profile: Pick<ProfileQuery['me'], 'id' | 'isFan'>
}

function UserActions(props: Props) {
  const { isInMyPage, profile } = props
  const [doFollow, { loading: followLoading }] = useFollowUserMutation()
  const [doUnfollow, { loading: unfollowLoading }] = useUnfollowUserMutation()
  const { t } = useTranslation()

  if (isInMyPage) {
    return null
  }

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        profile.isFan
          ? 'border border-white/40 bg-white/70 text-slate-700 backdrop-blur-sm hover:bg-white/90 dark:border-slate-800/40 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900/90'
          : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600'
      }`}
      title={t(`app.profile.fans.${profile.isFan ? 'un' : ''}follow`) ?? ''}
      disabled={followLoading || unfollowLoading}
      onClick={() => {
        if (followLoading || unfollowLoading) {
          return
        }
        const params = { targetUserID: profile.id }

        let mutationJob: Promise<any>
        if (profile.isFan) {
          mutationJob = doUnfollow({
            variables: params,
          })
        } else {
          mutationJob = doFollow({
            variables: params,
          })
        }
        return toast.promise(mutationJob, toastPromiseDefaultOption)
      }}
    >
      {profile.isFan ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      <span>{t(`app.profile.fans.${profile.isFan ? 'un' : ''}follow`)}</span>
    </button>
  )
}
export default UserActions
