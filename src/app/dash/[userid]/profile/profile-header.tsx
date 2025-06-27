'use client'
import React, { useState } from 'react'
import AvatarSection from './avatar-section'
import { ProfileQuery } from '@/schema/generated'
import AnimatedBackground from '@/components/animated-background/animated-background'
import BackgroundUploadModal from '@/components/background-upload-modal/background-upload-modal'
import Button from '@/components/button/button'
import { Edit3 } from 'lucide-react'

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
          <div className='absolute top-4 right-4 z-30'>
            <Button
              onClick={handleOpenModal}
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 text-sm px-3 py-1.5"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Change
            </Button>
          </div>
        )}

        {/* Enhanced Avatar Section */}
        <div className='absolute -bottom-20 left-8 z-20'>
          <div className='relative'>
            {/* Avatar glow effect */}
            <div className='absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse'></div>
            <AvatarSection profile={profile} uid={uid} isInMyPage={isInMyPage} />
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
