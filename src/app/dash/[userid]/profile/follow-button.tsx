'use client'

import Button from '@annatarhe/lake-ui/button'
import { useMutation } from '@apollo/client/react'
import { UserCheck, UserPlus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { FollowUserDocument, UnfollowUserDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { authHref } from '@/lib/auth-href'

type FollowButtonProps = {
  userId: number
  isFan: boolean
  signedIn: boolean
}

function FollowButton({ userId, isFan, signedIn }: FollowButtonProps) {
  const { t } = useTranslation(undefined, 'profile')
  const router = useRouter()
  const pathname = usePathname()
  const [following, setFollowing] = useState(isFan)
  const [synced, setSynced] = useState({ userId, isFan })
  // another profile, or fresh server data after a refresh, wins
  if (synced.userId !== userId || synced.isFan !== isFan) {
    setSynced({ userId, isFan })
    setFollowing(isFan)
  }
  const [hover, setHover] = useState(false)
  const [follow, { loading: followLoading }] = useMutation(FollowUserDocument)
  const [unfollow, { loading: unfollowLoading }] =
    useMutation(UnfollowUserDocument)
  const loading = followLoading || unfollowLoading

  const onClick = async () => {
    if (!signedIn) {
      router.push(authHref(pathname))
      return
    }
    if (loading) return
    const next = !following
    setFollowing(next)
    try {
      const variables = { targetUserID: userId }
      if (next) await follow({ variables })
      else await unfollow({ variables })
      router.refresh()
    } catch {
      setFollowing(!next)
      toast.error(t('followFailed'))
    }
  }

  if (following) {
    return (
      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        leadingIcon={<UserCheck className="size-4" />}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
      >
        {hover ? t('unfollow') : t('following')}
      </Button>
    )
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={loading}
      leadingIcon={<UserPlus className="size-4" />}
      onClick={onClick}
    >
      {t('follow')}
    </Button>
  )
}

export default FollowButton
