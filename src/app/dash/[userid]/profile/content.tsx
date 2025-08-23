import PageTrack from '@/components/track/page-track'
import type { ProfileQuery } from '@/gql/graphql'
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
    <div className='w-full flex flex-col items-center justify-center mt-6 px-4'>
      <PageTrack page='profile' params={{ userid: profile.id }} />

      {/* Main Profile Card */}
      <div className='w-full max-w-5xl relative group'>
        {/* Animated background glow */}
        <div className='absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-700 animate-pulse'></div>

        {/* Main card */}
        <div className='relative w-full rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/80 via-white/70 to-white/50 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/50 shadow-2xl border border-white/30 dark:border-gray-700/50 transition-all duration-500 hover:shadow-3xl'>
          {/* Subtle pattern overlay */}
          <div
            className='absolute inset-0 rounded-3xl opacity-20 dark:opacity-10'
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
