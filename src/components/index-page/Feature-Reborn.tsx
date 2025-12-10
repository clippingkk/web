import Tooltip from '@annatarhe/lake-ui/tooltip'
import { ArrowRightFromLine, ExternalLink } from 'lucide-react'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { USER_ID_KEY } from '@/constants/storage'
import { getTranslation } from '@/i18n'
import AndroidIcon from '../../assets/android-icon.svg'
import AppleIcon from '../../assets/apple-icon.svg'
import CKMPQRCode from '../../assets/ck_mp_qrcode.jpg'
import TerminalIcon from '../../assets/terminal-icon.svg'
import WechatIcon from '../../assets/wechat-icon.svg'

type DownloadChannelProps = {
  icon: string
  alt: string
  label: string
  href?: string
  tooltip?: React.ReactNode | string
  comingSoon?: boolean
}

const DownloadChannel: React.FC<DownloadChannelProps> = ({
  icon,
  alt,
  label,
  href,
  tooltip,
  comingSoon = false,
}) => {
  const content = (
    <div
      className={`
      relative overflow-hidden
      flex flex-col items-center justify-center
      p-6 rounded-2xl backdrop-blur-md 
      bg-gradient-to-br from-white/20 to-white/5 
      dark:from-slate-800/50 dark:to-slate-900/30
      border border-white/10 dark:border-slate-700/30
      shadow-lg transition-all duration-300
      ${href || tooltip ? 'hover:shadow-xl hover:scale-105 hover:from-white/30 hover:to-white/10 dark:hover:from-slate-700/60 dark:hover:to-slate-800/40' : ''}
      ${comingSoon ? 'opacity-70 hover:opacity-100' : ''}
    `}
    >
      <Image src={icon} alt={alt} width={80} height={80} className='mb-4' />
      <span className='font-medium text-gray-800 dark:text-gray-200'>
        {label}
      </span>
      {comingSoon && (
        <div className='absolute top-3 right-3 py-1 px-3 text-xs bg-purple-500 text-white rounded-full'>
          Coming Soon
        </div>
      )}
      {href && (
        <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <ExternalLink
            size={16}
            className='text-gray-700 dark:text-gray-300'
          />
        </div>
      )}
    </div>
  )

  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        {href ? (
          <a
            href={href}
            target='_blank'
            rel='noreferrer'
            className='group m-2 lg:m-4 w-[160px] lg:w-[180px]'
          >
            {content}
          </a>
        ) : (
          <div className='group m-2 lg:m-4 w-[160px] lg:w-[180px]'>
            {content}
          </div>
        )}
      </Tooltip>
    )
  }

  return href ? (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className='group m-2 lg:m-4 w-[160px] lg:w-[180px]'
    >
      {content}
    </a>
  ) : (
    <div className='group m-2 lg:m-4 w-[160px] lg:w-[180px]'>{content}</div>
  )
}

async function FeatureReborn() {
  const { t } = await getTranslation()

  const ck = await cookies()
  const uid = ck.get(USER_ID_KEY)?.value
  const goLinkUrl = uid ? `/dash/${uid}/home` : '/auth/auth-v4'

  return (
    <div className='relative w-full py-24 lg:py-36 overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute -left-24 top-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400/20 to-indigo-400/20 blur-xl'></div>
        <div className='absolute -right-24 top-3/4 w-96 h-96 rounded-full bg-gradient-to-r from-pink-400/20 to-rose-400/20 blur-xl'></div>
      </div>

      <div className='container mx-auto px-4'>
        {/* Title with gradient text */}
        <h2 className='text-4xl lg:text-7xl text-center font-extrabold mb-16 lg:mb-24'>
          <span className='bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent'>
            {t('app.index.features.reading4.title')}
          </span>
        </h2>

        {/* Download channels */}
        <div className='flex flex-wrap items-center justify-center max-w-5xl mx-auto mb-20 lg:mb-32'>
          <DownloadChannel
            icon={AppleIcon}
            alt='iOS App'
            label='iOS App'
            href='https://apps.apple.com/us/app/clippingkk/id1537830952'
          />

          <DownloadChannel
            icon={AndroidIcon}
            alt='Android App'
            label='Android App'
            tooltip='Coming Soon'
            comingSoon
          />

          <DownloadChannel
            icon={WechatIcon}
            alt='WeChat Mini Program'
            label='WeChat Mini App'
            tooltip={
              <div className='p-2 bg-white rounded-lg'>
                <Image
                  src={CKMPQRCode}
                  alt='ClippingKK Mini Program QR Code'
                  width={150}
                  height={150}
                  className='rounded'
                />
                <p className='text-sm text-center mt-2 text-gray-800'>
                  Scan to use
                </p>
              </div>
            }
          />

          <DownloadChannel
            icon={TerminalIcon}
            alt='CLI Tool'
            label='CLI Tool'
            href='https://github.com/clippingkk/cli'
          />
        </div>

        {/* Call to action button */}
        <div className='relative mx-auto max-w-3xl'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-lg opacity-70 rounded-2xl'></div>
          <Link
            href={goLinkUrl as any}
            className='relative block w-full py-6 lg:py-8 px-8 
              text-3xl lg:text-4xl rounded-2xl 
              text-white text-center font-bold
              bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600
              hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700
              shadow-lg hover:shadow-2xl
              transform hover:-translate-y-1
              active:scale-98 transition-all duration-300'
          >
            <div className='flex items-center justify-center space-x-3'>
              <ArrowRightFromLine size={28} />
              <span>{t('app.go')}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FeatureReborn
