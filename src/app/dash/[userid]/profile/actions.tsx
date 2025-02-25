'use client'
import { useTranslation } from '@/i18n/client'
import { ProfileQuery, useFollowUserMutation, useUnfollowUserMutation } from '@/schema/generated'
import { toastPromiseDefaultOption } from '@/services/misc'
import toast from 'react-hot-toast'

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
      className='px-4 py-2 rounded-sm bg-blue-400 text-gray-200 hover:bg-blue-600 mt-6 mr-4'
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
            variables: params
          })
        } else {
          mutationJob = doFollow({
            variables: params
          })
        }
        return toast.promise(mutationJob, toastPromiseDefaultOption)
      }}
    >
      {t(`app.profile.fans.${profile.isFan ? 'un' : ''}follow`)}
    </button>
  )
}
export default UserActions
