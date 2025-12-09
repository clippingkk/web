import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { AppFeatures } from '@/constants/features'
import { getTranslation } from '@/i18n/index'
import PureImages from '../backgrounds/pure-images'
import LinkIndicator from '../link-indicator'
import MovingLightsBackground from './moving-lights-background'

type HeroProps = {
  myUid?: number
}

async function Hero(props: HeroProps) {
  const { myUid } = props
  const { t } = await getTranslation()

  return (
    <div
      className='relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-200 to-indigo-200 dark:from-slate-900 dark:to-slate-950'
      style={{
        maxWidth: '100vw',
      }}
    >
      {/* Background layers */}
      <div className='absolute inset-0 z-0'>
        <PureImages lightingColor={'rgb(2, 6, 23)'} />
        <div className='absolute inset-0 bg-blue-50/70 backdrop-blur-sm dark:bg-black/60'></div>
        {/* Client-side moving lights */}
        <div className='absolute inset-0'>
          <MovingLightsBackground />
        </div>
      </div>

      {/* Content overlay */}
      <div className='absolute inset-0 z-10 flex items-center justify-center p-4'>
        <div className='w-full max-w-7xl'>
          <div className='flex flex-col items-center text-center'>
            {/* Main heading with enhanced gradient and size */}
            <h1
              className='font-lato relative m-0 mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-8xl font-black tracking-tight text-transparent md:text-9xl dark:from-blue-400 dark:via-blue-400 dark:to-indigo-400'
              style={{
                height: 128,
              }}
            >
              ClippingKK
            </h1>

            {/* Slogan with enhanced style */}
            <h2 className='font-lato mt-2 mb-10 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-3xl leading-relaxed font-bold tracking-wide text-transparent md:text-5xl dark:from-blue-300 dark:via-blue-400 dark:to-blue-500'>
              {t('app.slogan')}
            </h2>

            {/* Primary Call to Action - Go button with enhanced fancy effects */}
            <div className='my-10 flex items-center justify-center'>
              <Link
                href={myUid ? `/dash/${myUid}/home` : '/auth/auth-v4'}
                className='group relative z-10 scale-110 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 px-14 py-6 text-3xl font-black text-white shadow-2xl shadow-blue-500/40 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_30px_5px] hover:shadow-blue-500/50 active:scale-95 active:shadow-inner'
              >
                <span className='relative z-10 flex items-center gap-3'>
                  <span>{t('app.go')}</span>
                  <LinkIndicator className='ml-2'>
                    <ChevronRightIcon className='h-7 w-7 transition-transform duration-300 group-hover:translate-x-2' />
                  </LinkIndicator>
                </span>
                {/* Fancy hover effects */}
                <span className='absolute inset-0 z-0 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100'></span>
                {/* Glow effect */}
                <span className='absolute -inset-1 z-0 scale-[1.15] rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-70'></span>
                {/* Shine effect */}
                <span className='absolute inset-0 z-0 translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transition-transform duration-1000 group-hover:translate-x-[-300%]'></span>
              </Link>
            </div>

            {/* Secondary section for premium payment - lighter design */}
            {AppFeatures.enablePremiumPayment && (
              <div className='mt-4 mb-8'>
                <Link
                  href='/pricing'
                  className='group relative block overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/80 to-blue-600/80 px-6 py-3 text-lg font-medium text-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20 active:scale-98'
                >
                  <span className='relative z-10 flex items-center gap-2'>
                    <span className='mr-1'>✨</span>
                    <span>{t('app.plan.premium.name')}</span>
                    <LinkIndicator>
                      <ChevronRightIcon className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </LinkIndicator>
                  </span>
                  <span className='absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-blue-500/40 to-cyan-500/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></span>
                </Link>
              </div>
            )}

            {/* How to use link with subtle styling */}
            <a
              href='https://www.bilibili.com/video/BV1Nb41187Lo'
              target='_blank'
              className='mt-4 flex items-center gap-1 text-sm text-indigo-600 transition-colors duration-200 hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-white'
              referrerPolicy='no-referrer'
              rel='noopener'
            >
              {t('How to use?')}
              <ArrowTopRightOnSquareIcon className='h-4 w-4' />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
