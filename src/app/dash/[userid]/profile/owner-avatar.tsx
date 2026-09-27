'use client'

import Avatar from '@annatarhe/lake-ui/avatar'
import { useMutation } from '@apollo/client/react'
import { Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import AvatarPicker from '@/components/profile/avatar-picker'
import { UpdateProfileDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { resolveMediaUrl } from '@/utils/image'

type OwnerAvatarProps = {
  uid: number
  name: string
  avatar?: string | null
  isPremium: boolean
}

/** The owner's avatar doubles as the button that changes it. */
function OwnerAvatar({ uid, name, avatar, isPremium }: OwnerAvatarProps) {
  const { t } = useTranslation(undefined, 'profile')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [updateProfile] = useMutation(UpdateProfileDocument)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('avatar.change')}
        className="group focus-visible:ring-lake-ring focus-visible:ring-offset-lake-canvas relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Avatar
          src={avatar ? resolveMediaUrl(avatar) : null}
          name={name}
          size="xl"
          ring={isPremium ? 'premium' : 'none'}
        />
        <span
          aria-hidden="true"
          className="bg-lake-surface-raised border-lake-line text-lake-fg-muted group-hover:text-lake-fg shadow-lake-card absolute right-0 bottom-0 rounded-full border p-1.5 transition-colors duration-150"
        >
          <Camera className="size-4" />
        </span>
      </button>
      {open ? (
        <AvatarPicker
          uid={uid}
          opened={open}
          onCancel={() => setOpen(false)}
          onSubmit={async (next) => {
            await updateProfile({ variables: { avatar: next } })
            router.refresh()
          }}
        />
      ) : null}
    </>
  )
}

export default OwnerAvatar
