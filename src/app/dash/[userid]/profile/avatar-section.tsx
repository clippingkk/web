'use client'
import { useState } from 'react'

import Avatar from '@/components/avatar/avatar'
import AvatarPicker from '@/components/profile/avatar-picker'
import { type ProfileQuery, useUpdateProfileMutation } from '@/schema/generated'

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
    <div className="group relative">
      {/* Enhanced Avatar with multiple rings */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-80"></div>

        {/* Middle ring */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30"></div>

        {/* Inner border ring */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-300 to-purple-300"></div>

        {/* Avatar container */}
        <div className="relative">
          <Avatar
            img={profile.avatar ?? ''}
            name={profile.name}
            editable={isInMyPage}
            className="h-20 w-20 shadow-2xl transition-all duration-300 hover:scale-105 lg:h-36 lg:w-36"
            onClick={() => setIsPickingAvatar(true)}
          />

          {/* Edit indicator */}
          {isInMyPage && (
            <div className="absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transition-all duration-300 hover:scale-110 lg:h-10 lg:w-10 dark:border-gray-800">
              <svg
                className="h-4 w-4 text-white lg:h-5 lg:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
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
