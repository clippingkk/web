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
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/20 to-white/5 p-6 shadow-lg backdrop-blur-md transition-all duration-300 dark:border-slate-700/30 dark:from-slate-800/50 dark:to-slate-900/30 ${href || tooltip ? 'hover:scale-105 hover:from-white/30 hover:to-white/10 hover:shadow-xl dark:hover:from-slate-700/60 dark:hover:to-slate-800/40' : ''} ${comingSoon ? 'opacity-70 hover:opacity-100' : ''} `}
    >
      <Image src={icon} alt={alt} width={80} height={80} className="mb-4" />
      <span className="font-medium text-gray-800 dark:text-gray-200">
        {label}
      </span>
      {comingSoon && (
        <div className="absolute top-3 right-3 rounded-full bg-purple-500 px-3 py-1 text-xs text-white">
          Coming Soon
        </div>
      )}
      {href && (
        <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ExternalLink
            size={16}
            className="text-gray-700 dark:text-gray-300"
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
            target="_blank"
            rel="noreferrer"
            className="group m-2 w-[160px] lg:m-4 lg:w-[180px]"
          >
            {content}
          </a>
        ) : (
          <div className="group m-2 w-[160px] lg:m-4 lg:w-[180px]">
            {content}
          </div>
        )}
      </Tooltip>
    )
  }

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group m-2 w-[160px] lg:m-4 lg:w-[180px]"
    >
      {content}
    </a>
  ) : (
    <div className="group m-2 w-[160px] lg:m-4 lg:w-[180px]">{content}</div>
  )
}

async function FeatureReborn() {
  const { t } = await getTranslation()

  const ck = await cookies()
  const uid = ck.get(USER_ID_KEY)?.value
  const goLinkUrl = uid ? `/dash/${uid}/home` : '/auth/auth-v4'

  return (
    <div className="relative w-full overflow-hidden py-24 lg:py-36">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-24 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400/20 to-indigo-400/20 blur-xl"></div>
        <div className="absolute top-3/4 -right-24 h-96 w-96 rounded-full bg-gradient-to-r from-pink-400/20 to-rose-400/20 blur-xl"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Title with gradient text */}
        <h2 className="mb-16 text-center text-4xl font-extrabold lg:mb-24 lg:text-7xl">
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {t('app.index.features.reading4.title')}
          </span>
        </h2>

        {/* Download channels */}
        <div className="mx-auto mb-20 flex max-w-5xl flex-wrap items-center justify-center lg:mb-32">
          <DownloadChannel
            icon={AppleIcon}
            alt="iOS App"
            label="iOS App"
            href="https://apps.apple.com/us/app/clippingkk/id1537830952"
          />

          <DownloadChannel
            icon={AndroidIcon}
            alt="Android App"
            label="Android App"
            tooltip="Coming Soon"
            comingSoon
          />

          <DownloadChannel
            icon={WechatIcon}
            alt="WeChat Mini Program"
            label="WeChat Mini App"
            tooltip={
              <div className="rounded-lg bg-white p-2">
                <Image
                  src={CKMPQRCode}
                  alt="ClippingKK Mini Program QR Code"
                  width={150}
                  height={150}
                  className="rounded"
                />
                <p className="mt-2 text-center text-sm text-gray-800">
                  Scan to use
                </p>
              </div>
            }
          />

          <DownloadChannel
            icon={TerminalIcon}
            alt="CLI Tool"
            label="CLI Tool"
            href="https://github.com/clippingkk/cli"
          />
        </div>

        {/* Call to action button */}
        <div className="relative mx-auto max-w-3xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-70 blur-lg"></div>
          <Link
            href={goLinkUrl as any}
            className="relative block w-full transform rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 px-8 py-6 text-center text-3xl font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 hover:shadow-2xl active:scale-98 lg:py-8 lg:text-4xl"
          >
            <div className="flex items-center justify-center space-x-3">
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
