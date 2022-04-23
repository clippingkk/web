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

const bgs = [
  'https://ck-cdn.annatarhe.cn/lrYm87HbNXn7rU1vBdh4iC7dXUGB8St2/DSCF1642.jpg',
  'https://ck-cdn.annatarhe.cn/k0eLe3mUbrMrYqJw9HPFDmSWIBqmnLpX/DSCF1611.jpg',
  'https://ck-cdn.annatarhe.cn/UmzmeThtEhYvVewG5TkBmS8IEGiAGSwI/DSCF1609.jpg',
  'https://ck-cdn.annatarhe.cn/nwTvnaDfnzGR4axGYCMQ9my0Sq2MGk0c/DSCF1575.jpg',
  'https://ck-cdn.annatarhe.cn/aRHhsYQI9hg6aqDhFvAEiqyi1gJzJnca/DSCF1310.jpg',
  'https://ck-cdn.annatarhe.cn/41me0rLT3nU4pdv9PdSMSNPR2acAvbQ4/DSCF1109.jpg',
  'https://ck-cdn.annatarhe.cn/RhcWMEhdl9h6hJD7kO9UNN8mzIFDKRva/DSCF1069-HDR.jpg',
  // 'coffee-blur.jpg',
]

function Hero() {
  const { t } = useTranslation()
  const [bgIdx, setBgIdx] = useState(0)
  useEffect(() => {
    setBgIdx(Math.floor(Math.random() * bgs.length))
  }, [])
  return (
    <div
      className={'flex flex-col justify-center h-screen w-full max-h-screen bg-cover'}
      style={{
        backgroundImage: `url(${bgs[bgIdx]})`,
        maxWidth: '100vw'
      }}
    >
      <div className='w-full h-full backdrop-blur-xl bg-black dark:bg-opacity-40 bg-opacity-10 flex flex-col justify-center'>
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
                  className={styles['download-btn'] + ' py-4 px-12 text-6xl rounded-lg block font-light text-white my-6 hover:shadow-2xl bg-gradient-to-br from-blue-500 to-purple-700 text-center'}
                >
                  {t('app.go')}
                </a>
              </Link>
            </div>
          </div>

          <VideoTipsArea />

        </div>
      </div>
    </div>
  )
}

export default Hero
