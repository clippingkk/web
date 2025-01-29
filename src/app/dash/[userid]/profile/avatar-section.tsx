'use client'
import Avatar from '@/components/avatar/avatar'
import AvatarPicker from '@/components/profile/avatar-picker'
import { ProfileQuery, useUpdateProfileMutation } from '@/schema/generated'
import { useState } from 'react'


type Props = {
  profile: Pick<ProfileQuery['me'], 'avatar' | 'name'>
  uid?: number
  isInMyPage: boolean
}

function AvatarSection(props: Props) {
  const { profile, uid, isInMyPage } = props
  const [doUpdate] = useUpdateProfileMutation()

  const [isPickingAvatar, setIsPickingAvatar] = useState(false)
  return (
    <>
      <Avatar
        img={profile.avatar ?? ''}
        name={profile.name}
        editable={isInMyPage}
        className='w-16 h-16 mr-12 lg:w-32 lg:h-32'
        onClick={() => setIsPickingAvatar(true)}
      />
      {isPickingAvatar && uid && (
        <AvatarPicker
          onCancel={() => setIsPickingAvatar(false)}
          onSubmit={(nextAvatar) => {
            return doUpdate({
              variables: {
                avatar: nextAvatar
              }
            })
          }}
          opened={isPickingAvatar}
          uid={uid}
        />
      )}
    </>
  )
}

export default AvatarSection
