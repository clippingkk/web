import React from 'react'
import { ProfileQuery  } from '@/schema/generated'
import PageTrack from '@/components/track/page-track'
import ProfileHeader from './profile-header' // New import
import ProfileDetails from './profile-details' // New import

type ProfilePageContentProps = {
  myUid?: number
  profile: ProfileQuery['me']
}

async function ProfilePageContent(props: ProfilePageContentProps) {
  const { profile, myUid: uid } = props
  const year = (new Date()).getFullYear() - ((new Date()).getMonth() > 6 ? 0 : 1)
  const isInMyPage = uid === profile.id

  return (
    <div className='w-full flex flex-col items-center justify-center mt-4'>
      <PageTrack page='profile' params={{userid: profile.id}} />
      
      <div className='w-full max-w-4xl rounded-2xl overflow-hidden backdrop-blur-lg bg-gradient-to-br from-white/60 via-white/50 to-white/30 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40 shadow-2xl border border-gray-200/80 dark:border-gray-700/80'>
        <ProfileHeader 
          profile={profile}
          uid={uid}
          isInMyPage={isInMyPage}
        />
        <ProfileDetails 
          profile={profile}
          uid={uid}
          isInMyPage={isInMyPage}
          year={year}
        />
      </div>
    </div>
  )
}

export default ProfilePageContent

