import React from 'react'
import { useTranslation } from '@/i18n'
import Image from 'next/image'
import LockIcon from '../../assets/lock-security-protection-secure-safety-password-svgrepo-com.svg'
import iOSWidgetImage from '../../assets/ios_widget.png'
import DeviceIPhoneX from '../device/iPhoneX'

async function FeatureSense() {
  const { t } = await useTranslation()
  return (
    <div className='flex items-center w-full justify-around py-16 flex-col'>
      <h3 className={'lg:text-7xl text-4xl font-extrabold text-center max-w-xs mb-8 lg:mb-0 pb-4 flex overflow-x-visible from-indigo-300 to-blue-500 bg-clip-text text-transparent bg-gradient-to-br'}>
        {t('app.index.features.sense.title')}
      </h3>

      <div className='mt-8 w-full flex-col lg:flex-row'>
        <div className=' flex items-center justify-around flex-col lg:flex-row'>
          <DeviceIPhoneX className='scale-75 lg:scale-100'>
            <Image
              src={iOSWidgetImage.src}
              alt={t('app.index.features.sense.f2')}
              width={iOSWidgetImage.width / 3}
              height={iOSWidgetImage.height / 3}
            />
          </DeviceIPhoneX>
          <div className='flex justify-center flex-col items-center lg:items-start'>
            <h3 className={'lg:text-7xl font-lxgw font-bold text-4xl text-center mb-8 lg:mb-0 pb-4 flex overflow-x-visible from-blue-300 to-orange-400 bg-clip-text text-transparent bg-gradient-to-br'}>
              {t('app.index.features.sense.f1')}
            </h3>
            <span className='text-center block dark:text-gray-100'>
              {t('app.index.features.sense.f1Desc')}
            </span>
          </div>
        </div>

        <div className=' flex items-center justify-around my-24 lg:my-72 flex-col lg:flex-row'>
          <div className='flex justify-center flex-col items-center lg:items-start'>
            <h3 className={'lg:text-7xl font-lxgw font-bold text-4xl text-center mb-8 lg:mb-0 pb-4 flex overflow-x-visible from-blue-300 to-orange-400 bg-clip-text text-transparent bg-gradient-to-br'}>
              {t('app.index.features.sense.f2')}
            </h3>
            <span className='text-center block dark:text-gray-100'>
              {t('app.index.features.sense.f2Desc')}
            </span>
          </div>
          <Image
            src={LockIcon}
            alt={t('app.index.features.sense.f2')}
            width={LockIcon.width / 2}
            height={LockIcon.height / 2}
          />
        </div>

        <div className=' flex items-center flex-col lg:flex-row justify-around'>
          <div>
            <span className=' text-9xl select-none'>👍</span>
          </div>
          <div className='flex justify-center flex-col items-center lg:items-start'>
            <h3 className={'lg:text-7xl font-lxgw font-bold text-4xl text-center mb-8 lg:mb-0 pb-4 flex overflow-x-visible from-indigo-300 to-purple-400 bg-clip-text text-transparent bg-gradient-to-br mt-12 lg:mt-0'}>
              {t('app.index.features.sense.f3')}
            </h3>
            <span className='text-center block dark:text-gray-100'>
              {t('app.index.features.sense.f3Desc')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureSense
