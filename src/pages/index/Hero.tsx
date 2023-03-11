import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import styles from './Hero.module.css'
import { useBackgroundImage } from '../../hooks/theme'
import { useSelector } from 'react-redux';
import { TGlobalStore } from '../../store';
import { useGoAuthLink } from '../../hooks/hooks'
import { Button } from '@mantine/core'
import { ChevronRightIcon } from '@heroicons/react/24/solid'

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

function Hero() {
  const { t } = useTranslation()
  const bg = useBackgroundImage()

  const goLinkUrl = useGoAuthLink()

  return (
    <div
      className={'flex flex-col justify-center h-screen w-full max-h-screen bg-cover'}
      style={{
        backgroundImage: `url(${bg.src})`,
        maxWidth: '100vw'
      }}
    >
      <div className='w-full h-full backdrop-blur-xl bg-black dark:bg-opacity-40 bg-opacity-10 flex flex-col justify-center'>
        <div className={styles.titleField + ' my-8 mx-8 md:my-20 md:mx-20 flex items-center justify-center flex-col md:flex-row'}>
          <div className='flex-1 mb-8'>
            <h1 className='text-8xl m-0 font-extrabold font-lxgw bg-clip-text from-orange-300 to-sky-400 text-transparent bg-gradient-to-br'>ClippingKK</h1>
            <h4 className='text-3xl mt-4 font-lxgw bg-clip-text from-green-300 to-indigo-400 text-transparent bg-gradient-to-br'>{t('app.slogan')}</h4>
            <div className='flex items-end my-6'>
              <Link
                href={goLinkUrl}
                className={'w-fit py-4 px-12 text-6xl rounded-lg block font-extrabold text-white hover:shadow-2xl bg-gradient-to-br from-blue-500 to-purple-700 text-center'}>
                {t('app.go')}
              </Link>

                <Button
                  component={Link}
                  href='/pricing'
                  className='text-xl ml-4'
                  rightIcon={<ChevronRightIcon className='w-4 h-4' />}
                >
                  😎 Premier
                </Button>
            </div>
          </div>

          <VideoTipsArea />

        </div>
      </div>
    </div>
  );
}

export default Hero
