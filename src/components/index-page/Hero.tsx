import { useTranslation } from '@/i18n/index'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { AppFeatures } from '../../constants/features'
import PureImages from '../backgrounds/pure-images'
import MovingLightsBackground from './moving-lights-background'

type HeroProps = {
  myUid?: number
}

async function Hero(props: HeroProps) {
  const { myUid } = props
  const { t } = await useTranslation()

  return (
    <div
      className={'relative h-screen w-full overflow-hidden bg-slate-900'}
      style={{
        maxWidth: '100vw',
      }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 to-slate-900">
        <PureImages lightingColor={'rgb(2, 6, 23)'} />
        <div className="absolute inset-0 bg-black opacity-60"></div>
        {/* Client-side moving lights */}
        <div className="absolute inset-0">
          <MovingLightsBackground />
        </div>
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Main heading with enhanced gradient and size */}
            <h1
              className="font-lato relative m-0 mb-4 bg-gradient-to-r from-orange-300 via-pink-400 to-sky-400 bg-clip-text text-8xl font-black tracking-tight text-transparent md:text-9xl"
              style={{
                height: 128,
              }}
            >
              ClippingKK
            </h1>

            {/* Slogan with enhanced style */}
            <h2 className="font-lato mt-2 mb-10 bg-gradient-to-r from-green-300 via-blue-400 to-indigo-500 bg-clip-text text-3xl leading-relaxed font-bold tracking-wide text-transparent md:text-5xl">
              {t('app.slogan')}
            </h2>

            {/* Call to action buttons with enhanced styling */}
            <div className="my-10 flex flex-col items-center justify-center gap-6 md:flex-row">
              <Link
                href={myUid ? `/dash/${myUid}/home` : '/auth/auth-v4'}
                className="group relative z-10 scale-105 overflow-hidden rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 px-10 py-5 text-2xl font-bold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>{t('app.go')}</span>
                  <ChevronRightIcon className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 z-0 bg-gradient-to-r from-fuchsia-600 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              </Link>

              {AppFeatures.enablePremiumPayment && (
                <Link
                  href="/pricing"
                  className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 px-8 py-4 text-xl font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="mr-1">✨</span>
                    <span>{t('app.plan.premium.name')}</span>
                    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                </Link>
              )}
            </div>

            {/* How to use link with subtle styling */}
            <a
              href="https://www.bilibili.com/video/BV1Nb41187Lo"
              target="_blank"
              className="mt-4 flex items-center gap-1 text-sm text-gray-300 transition-colors duration-200 hover:text-white hover:underline"
              referrerPolicy="no-referrer"
            >
              {t('How to use?')}
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
