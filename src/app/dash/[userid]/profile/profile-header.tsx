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
    <div className='relative w-full h-52 md:h-60 lg:h-72'>
      {/* Multi-layered Animated Background */}
      <div className='absolute inset-0 w-full h-full'>
        {/* Primary gradient layer */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-xy'></div>
        
        {/* Secondary shimmer layer */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer'></div>
        
        {/* Organic shapes overlay */}
        <div className='absolute inset-0 opacity-30'>
          <div className='absolute top-1/4 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-xl animate-float'></div>
          <div className='absolute top-1/2 right-1/4 w-24 h-24 bg-white/15 rounded-full blur-lg animate-float-delayed'></div>
          <div className='absolute bottom-1/4 left-1/3 w-20 h-20 bg-white/25 rounded-full blur-md animate-float-slow'></div>
        </div>
        
        {/* Subtle noise texture */}
        <div className='absolute inset-0 opacity-10 bg-[url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.4"/%3E%3C/svg%3E")]'></div>
      </div>

      {/* Enhanced Avatar Section */}
      <div className='absolute -bottom-20 left-8 z-20'>
        <div className='relative'>
          {/* Avatar glow effect */}
          <div className='absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse'></div>
          <AvatarSection profile={profile} uid={uid} isInMyPage={isInMyPage} />
        </div>
      </div>
      
      {/* Gradient overlay for better contrast */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent'></div>
    </div>
  )
}

export default ProfileHeader
