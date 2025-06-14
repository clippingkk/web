import React from 'react'
import AvatarSection from './avatar-section'
import { ProfileQuery } from '@/schema/generated'

type ProfileHeaderProps = {
  profile: ProfileQuery['me']
  uid?: number
  isInMyPage: boolean
}

const ProfileHeader = ({ profile, uid, isInMyPage }: ProfileHeaderProps) => {
  return (
    <div className='relative w-full h-48 md:h-56 lg:h-64'>
      {/* Animated Gradient Background */}
      <div className='absolute inset-0 w-full h-full bg-gradient-to-br from-primary via-purple-600 to-pink-500 animate-gradient-xy' style={{ filter: 'blur(50px)' }} />
      
      {/* Optional: Add a subtle pattern or overlay if desired for more texture */}
      {/* <div className='absolute inset-0 opacity-10 bg-[url("/path/to/subtle-pattern.svg")] bg-repeat' /> */}

      <div className='absolute -bottom-16 left-8 z-10'>
        <AvatarSection profile={profile} uid={uid} isInMyPage={isInMyPage} />
      </div>
    </div>
  )
}

export default ProfileHeader
