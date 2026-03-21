import PageTrack from '@/components/track/page-track'
import type { ProfileQuery } from '@/schema/generated'

import ProfileDetails from './profile-details' // New import
import ProfileHeader from './profile-header' // New import

type ProfilePageContentProps = {
  myUid?: number
  profile: ProfileQuery['me']
}

async function ProfilePageContent(props: ProfilePageContentProps) {
  const { profile, myUid: uid } = props
  const year = new Date().getFullYear() - (new Date().getMonth() > 6 ? 0 : 1)
  const isInMyPage = uid === profile.id

  return (
    <div className="mt-6 flex w-full flex-col items-center justify-center px-4">
      <PageTrack page="profile" params={{ userid: profile.id }} />

      {/* Main Profile Card */}
      <div className="group relative w-full max-w-5xl">
        {/* Animated background glow */}
        <div className="absolute -inset-1 animate-pulse rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-lg transition-opacity duration-700 group-hover:opacity-30"></div>

        {/* Main card */}
        <div className="hover:shadow-3xl relative w-full overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/80 via-white/70 to-white/50 shadow-2xl backdrop-blur-xl transition-all duration-500 dark:border-gray-700/50 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/50">
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 rounded-3xl opacity-20 dark:opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          ></div>

          <ProfileHeader profile={profile} uid={uid} isInMyPage={isInMyPage} />
          <ProfileDetails
            profile={profile}
            uid={uid}
            isInMyPage={isInMyPage}
            year={year}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfilePageContent
