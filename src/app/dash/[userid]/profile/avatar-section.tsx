'use client'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import Avatar from '@/components/avatar/avatar'
import AvatarPicker from '@/components/profile/avatar-picker'
import {
  type ProfileQuery,
  UpdateProfileDocument,
  type UpdateProfileMutation,
} from '@/gql/graphql'

type Props = {
  profile: Pick<ProfileQuery['me'], 'avatar' | 'name'>
  uid?: number
  isInMyPage: boolean
}

function AvatarSection(props: Props) {
  const { profile, uid, isInMyPage } = props
  const [doUpdate] = useMutation<UpdateProfileMutation>(UpdateProfileDocument)

  const [isPickingAvatar, setIsPickingAvatar] = useState(false)
  return (
    <div className='relative group'>
      {/* Enhanced Avatar with multiple rings */}
      <div className='relative'>
        {/* Outer glow ring */}
        <div className='absolute -inset-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300'></div>

        {/* Middle ring */}
        <div className='absolute -inset-2 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 rounded-full'></div>

        {/* Inner border ring */}
        <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full'></div>

        {/* Avatar container */}
        <div className='relative'>
          <Avatar
            img={profile.avatar ?? ''}
            name={profile.name}
            editable={isInMyPage}
            className='w-20 h-20 lg:w-36 lg:h-36 transition-all duration-300 hover:scale-105 shadow-2xl'
            onClick={() => setIsPickingAvatar(true)}
          />

          {/* Edit indicator */}
          {isInMyPage && (
            <div className='absolute -bottom-1 -right-1 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 transition-all duration-300 hover:scale-110 cursor-pointer'>
              <svg
                className='w-4 h-4 lg:w-5 lg:h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {isPickingAvatar && uid && (
        <AvatarPicker
          onCancel={() => setIsPickingAvatar(false)}
          onSubmit={(nextAvatar) => {
            return doUpdate({
              variables: {
                avatar: nextAvatar,
              },
            })
          }}
          opened={isPickingAvatar}
          uid={uid}
        />
      )}
    </div>
  )
}

export default AvatarSection
