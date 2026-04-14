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
        {/* Subtle background glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-sky-400/20 opacity-40 blur transition-opacity duration-500 group-hover:opacity-60" />

        {/* Main card */}
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-sm backdrop-blur-xl transition-shadow duration-500 hover:shadow-md dark:border-slate-800/40 dark:bg-slate-900/70">
          {/* Subtle pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-20 dark:opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.18) 1px, transparent 0)',
              backgroundSize: '20px 20px',
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
