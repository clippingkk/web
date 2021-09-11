import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import styles from './Hero.module.css'

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
        scrolling="no"
        allow="fullscreen"
        className={styles.video}
      />
    </div>
  )
}

function Hero() {
  const { t } = useTranslation()
  return (
    <div className={'flex flex-col justify-center ' + styles.hero}>
      <div className={styles.titleField + ' my-8 mx-8 md:my-20 md:mx-20 flex items-center justify-center flex-col md:flex-row'}>
        <div className='flex-1 mb-8'>
          <h1 className={styles.title + ' mx-0 my-0 font-light text-white font-lxgw'}>ClippingKK</h1>
          <h4 className='text-white text-3xl font-lxgw'>{t('app.slogan')}</h4>
          <div className={styles.platformSection}>
            <Link
              href='/auth/signin'
            >
              <a
                target="_blank"
                className={styles['download-btn'] + ' py-4 px-12 text-6xl rounded-lg block font-light text-white my-6 hover:shadow-2xl'}
              >
                {t('app.go')}
              </a>
            </Link>
          </div>
        </div>

        <VideoTipsArea />

      </div>
    </div>
  )
}

export default Hero
