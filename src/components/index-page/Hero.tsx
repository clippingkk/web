import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useGoAuthLink } from '../../hooks/hooks'
import { Button } from '@mantine/core'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { AppFeatures } from '../../constants/features'
import styles from './Hero.module.css'
import PureImages from '../backgrounds/pure-images';
import Image from 'next/image';
import buttonStyles from '../../components/button/lighten.module.css';
import bgLightsPng from '../../assets/bg-lights.png'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { ProfileQuery } from '../../schema/generated'

function useLoad() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    function onload() {
      setLoaded(true)
    }
    window.addEventListener('load', onload)
    return () => {
      window.removeEventListener('load', onload)
    }
  }, [])

  return loaded
}

function VideoTipsArea() {
  const loaded = useLoad()
  if (!loaded) {
    return null
  }

  return null

  // return <YouTubeEmbed videoid="0eQASJHQIGk" height={400} params="controls=0" />

  return (
    <div className='flex-1'>
      <iframe
        src="//player.bilibili.com/player.html?aid=44625474&cid=78121984&page=1"
        allow="fullscreen"
        className={styles.video}
      />
    </div>
  )
}

type HeroProps = {
  bgInfo: {
    src: string;
    blurHash: string;
  }
  me?: ProfileQuery['me']
}

function Hero(props: HeroProps) {
  const { me } = props
  // const { bgInfo: bg } = props
  const { t } = useTranslation()
  const goLinkUrl = useGoAuthLink(me)

  return (
    <div
      className={'h-screen w-full max-h-screen bg-cover relative'}
      style={{
        maxWidth: '100vw'
      }}
    >
      <div className='relative h-full w-full'>
        <PureImages
          lightingColor={'rgb(2, 6, 23)'}
        />
        <Image src={bgLightsPng} alt='bg-lights' className='absolute top-0 left-0 w-full h-full object-cover' />
      </div>
      <div className='w-[100vw] h-[100vh] backdrop-blur-xl bg-black dark:bg-opacity-40 bg-opacity-10 flex flex-col justify-center absolute top-0 left-0'>
        <div className={styles.titleField + ' my-8 mx-8 md:my-20 md:mx-20 flex items-center justify-center flex-col md:flex-row'}>
          <div className='flex-1 mb-8'>
            <h1 className='text-8xl m-0 font-extrabold bg-clip-text from-orange-300 to-sky-400 text-transparent bg-gradient-to-br font-lato pb-2'>ClippingKK</h1>
            <h4 className='text-3xl mt-4 font-lato bg-clip-text from-green-300 to-indigo-400 text-transparent bg-gradient-to-br'>{t('app.slogan')}</h4>
            <div className='flex items-end my-6'>
              <Link
                href={goLinkUrl}
                className={buttonStyles.lightenButton}>
                {t('app.go')}
              </Link>

              {AppFeatures.enablePremiumPayment && (
                <Button
                  component={Link}
                  href='/pricing'
                  variant='gradient'
                  gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                  className='text-xl ml-6 transition-all active:scale-95 duration-150'
                  rightSection={<ChevronRightIcon className='w-4 h-4' />}
                >
                  😎 {t('app.plan.premium.name')}
                </Button>
              )}
            </div>
            <Button
              variant='transparent'
              component='a'
              rightSection={<ArrowTopRightOnSquareIcon className='w-4 h-4' />}
              href='https://www.bilibili.com/video/BV1Nb41187Lo'
              target='_blank'
              className='hover:underline'
              referrerPolicy='no-referrer'
            >
              How to use?
            </Button>
          </div>

          <VideoTipsArea />

        </div>
      </div>
    </div>
  );
}

export default Hero
