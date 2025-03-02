import React from 'react'
import Image from 'next/image'
import AppleIcon from '../../assets/apple-icon.svg'
import AndroidIcon from '../../assets/android-icon.svg'
import TerminalIcon from '../../assets/terminal-icon.svg'
import WechatIcon from '../../assets/wechat-icon.svg'
import CKMPQRCode from '../../assets/ck_mp_qrcode.jpg'
import { useTranslation } from '@/i18n'
import { Tooltip } from '@mantine/core'
import Link from 'next/link'
import { cookies } from 'next/headers'

async function FeatureReborn() {
  const { t } = await useTranslation()

  const ck = await cookies()
  const uid = ck.get('uid')?.value
  const goLinkUrl = uid ? `/dash/${uid}/home` : '/auth/auth-v4'
  return (
    <div className='flex items-center mt-24 lg:mt-72 w-full justify-around py-16 flex-col'>
      <h3 className={'lg:text-7xl text-4xl text-center mb-8 lg:mb-0 pb-4 flex overflow-x-visible from-gray-800 to-pink-300 font-extrabold bg-clip-text text-transparent bg-linear-to-br'}>
        {t('app.index.features.reading4.title')}
      </h3>

      <div className='my-24 lg:my-72 flex flex-wrap'>
        <a
          href='https://apps.apple.com/us/app/clippingkk/id1537830952'
          target='_blank'
          rel="noreferrer"
          className=' block p-8 rounded-sm hover:bg-purple-200 hover:shadow-2xl transition-colors duration-300'
        >
          <Image
            src={AppleIcon}
            alt='ios'
            width={100}
            height={100}
          />
        </a>
        <Tooltip label={'will release soon'}>
          <div
            className=' block p-8 rounded-sm hover:bg-purple-200 hover:shadow-2xl transition-colors duration-300'
          >
            <Image
              src={AndroidIcon}
              alt='android'
              width={100}
              height={100}
            />
          </div>
        </Tooltip>
        <Tooltip
          label={(
            <Image
              src={CKMPQRCode}
              alt='clippingkk mini program'
              width={100}
              height={100}
            />
          )}
        >
          <div
            className=' block p-8 rounded-sm hover:bg-purple-200 hover:shadow-2xl transition-colors duration-300'
          >
            <Image
              src={WechatIcon}
              alt='wechat mini program'
              width={100}
              height={100}
            />
          </div>
        </Tooltip>

        <a
          href='https://github.com/clippingkk/cli'
          target='_blank'
          rel="noreferrer"
          className=' block p-8 rounded-sm hover:bg-purple-200 hover:shadow-2xl transition-colors duration-300'
        >
          <Image
            src={TerminalIcon}
            alt='ios'
            width={100}
            height={100}
          />
        </a>
      </div>

      <Link
        href={goLinkUrl}
        className={'w-full py-8 text-6xl rounded-lg block text-white my-6 hover:shadow-2xl bg-linear-to-br from-sky-300 to-teal-400 text-center font-extrabold active:scale-95 duration-150 transition-all dark:from-slate-700 dark:to-slate-950'}
      >
        {t('app.go')}
      </Link>

    </div>
  )
}

export default FeatureReborn
