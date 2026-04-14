'use client'
import { Edit3 } from 'lucide-react'
import { useState } from 'react'

import AnimatedBackground from '@/components/animated-background/animated-background'
import BackgroundUploadModal from '@/components/background-upload-modal/background-upload-modal'
import Button from '@/components/button/button'
import type { ProfileQuery } from '@/schema/generated'

import AvatarSection from './avatar-section'

type ProfileHeaderProps = {
  profile: ProfileQuery['me']
  uid?: number
  isInMyPage: boolean
}

const ProfileHeader = ({ profile, uid, isInMyPage }: ProfileHeaderProps) => {
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBackgroundChange = (newImageUrl: string) => {
    setBackgroundImage(newImageUrl)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <AnimatedBackground backgroundImage={backgroundImage}>
        {/* Change Background Button - Only show for profile owner */}
        {isInMyPage && (
          <div className="absolute top-4 right-4 z-30">
            <Button
              onClick={handleOpenModal}
              variant="outline"
              disabled
              className="border-white/40 bg-white/70 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors duration-200 hover:bg-white/90 dark:border-slate-800/40 dark:bg-slate-900/70 dark:hover:bg-slate-900/90"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Change
            </Button>
          </div>
        )}

        {/* Enhanced Avatar Section */}
        <div className="absolute -bottom-20 left-8 z-20">
          <div className="relative">
            {/* Avatar glow effect */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-400/40 via-indigo-400/40 to-sky-400/40 opacity-60 blur-xl" />
            <AvatarSection
              profile={profile}
              uid={uid}
              isInMyPage={isInMyPage}
            />
          </div>
        </div>
      </AnimatedBackground>

      {/* Background Upload Modal */}
      <BackgroundUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleBackgroundChange}
      />
    </>
  )
}

export default ProfileHeader
