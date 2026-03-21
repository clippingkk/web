import Image from 'next/image'

import { getTranslation } from '@/i18n'

import iOSWidgetImage from '../../assets/ios_widget.png'
import LockIcon from '../../assets/lock-security-protection-secure-safety-password-svgrepo-com.svg'
import DeviceIPhoneX from '../device/iPhoneX'

async function FeatureSense() {
  const { t } = await getTranslation()
  return (
    <div className="flex w-full flex-col items-center justify-around py-16">
      <h3
        className={
          'mb-8 flex max-w-xs overflow-x-visible bg-linear-to-br from-indigo-300 to-blue-500 bg-clip-text pb-4 text-center text-4xl font-extrabold text-transparent lg:mb-0 lg:text-7xl'
        }
      >
        {t('app.index.features.sense.title')}
      </h3>

      <div className="mt-8 w-full flex-col lg:flex-row">
        <div className="flex flex-col items-center justify-around lg:flex-row">
          <DeviceIPhoneX className="scale-75 lg:scale-100">
            <Image
              src={iOSWidgetImage.src}
              alt={t('app.index.features.sense.f2')}
              width={iOSWidgetImage.width / 3}
              height={iOSWidgetImage.height / 3}
            />
          </DeviceIPhoneX>
          <div className="flex flex-col items-center justify-center lg:items-start">
            <h3
              className={
                'font-lxgw mb-8 flex overflow-x-visible bg-linear-to-br from-blue-300 to-orange-400 bg-clip-text pb-4 text-center text-4xl font-bold text-transparent lg:mb-0 lg:text-7xl'
              }
            >
              {t('app.index.features.sense.f1')}
            </h3>
            <span className="block text-center dark:text-gray-100">
              {t('app.index.features.sense.f1Desc')}
            </span>
          </div>
        </div>

        <div className="my-24 flex flex-col items-center justify-around lg:my-72 lg:flex-row">
          <div className="flex flex-col items-center justify-center lg:items-start">
            <h3
              className={
                'font-lxgw mb-8 flex overflow-x-visible bg-linear-to-br from-blue-300 to-orange-400 bg-clip-text pb-4 text-center text-4xl font-bold text-transparent lg:mb-0 lg:text-7xl'
              }
            >
              {t('app.index.features.sense.f2')}
            </h3>
            <span className="block text-center dark:text-gray-100">
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

        <div className="flex flex-col items-center justify-around lg:flex-row">
          <div>
            <span className="text-9xl select-none">👍</span>
          </div>
          <div className="flex flex-col items-center justify-center lg:items-start">
            <h3
              className={
                'font-lxgw mt-12 mb-8 flex overflow-x-visible bg-linear-to-br from-indigo-300 to-purple-400 bg-clip-text pb-4 text-center text-4xl font-bold text-transparent lg:mt-0 lg:mb-0 lg:text-7xl'
              }
            >
              {t('app.index.features.sense.f3')}
            </h3>
            <span className="block text-center dark:text-gray-100">
              {t('app.index.features.sense.f3Desc')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureSense
