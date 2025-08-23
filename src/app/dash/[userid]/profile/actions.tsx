'use client'
import { useMutation } from '@apollo/client/react'
import { UserMinus, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  FollowUserDocument,
  type FollowUserMutation,
  type ProfileQuery,
  UnfollowUserDocument,
  type UnfollowUserMutation,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { toastPromiseDefaultOption } from '@/services/misc'

type Props = {
  isInMyPage: boolean
  profile: Pick<ProfileQuery['me'], 'id' | 'isFan'>
}

function UserActions(props: Props) {
  const { isInMyPage, profile } = props
  const [doFollow, { loading: followLoading }] =
    useMutation<FollowUserMutation>(FollowUserDocument)
  const [doUnfollow, { loading: unfollowLoading }] =
    useMutation<UnfollowUserMutation>(UnfollowUserDocument)
  const { t } = useTranslation()

  if (isInMyPage) {
    return null
  }

  return (
    <button
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 ${
        profile.isFan
          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:from-blue-600 hover:to-purple-700 hover:shadow-lg'
      }`}
      title={t(`app.profile.fans.${profile.isFan ? 'un' : ''}follow`) ?? ''}
      disabled={followLoading || unfollowLoading}
      onClick={() => {
        if (followLoading || unfollowLoading) {
          return
        }
        const params = { targetUserID: profile.id }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <UserMinus className='h-4 w-4' />
      ) : (
        <UserPlus className='h-4 w-4' />
      )}
      <span>{t(`app.profile.fans.${profile.isFan ? 'un' : ''}follow`)}</span>
    </button>
  )
}
export default UserActions
