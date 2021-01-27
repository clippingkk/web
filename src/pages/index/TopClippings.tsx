import { Link } from '@reach/router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { publicData_public_clippings } from '../../schema/__generated__/publicData'

const styles = require('./top-clippings.css').default

type TopClippingsProps = {
  clippings?: readonly publicData_public_clippings[]
}

function SimpleAvatar({ avatar }: any) {

    const imageUrl = avatar.startsWith('http') ? avatar : `https://clippingkk-cdn.annatarhe.com/${avatar}-copyrightDB`
    return (
      <img src={imageUrl} className='w-8 h-8 rounded-full' />
    )
}

function TopClippings(props: TopClippingsProps) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-wrap justify-center items-center'>
      <h2 className='text-3xl text-center font-bold my-8 dark:text-gray-200'>
        {t('app.public.clippings')}
      </h2>
      <div className='flex flex-wrap justify-center items-center'>
      {props.clippings?.map(c => (
        <Link
          className={`h-96 w-full md:w-1/2 lg:w-1/3 2xl:w-1/4 p-8 bg-gradient-to-br from-yellow-300 to-red-400 dark:from-gray-500 dark:to-gray-700 m-4 rounded-lg flex flex-col justify-between dark:text-gray-200 hover:scale-105 transform duration-300 ${styles.clippingItem}`}
          key={c.id}
          to={`/dash/${c.creator.id}/clippings/${c.id}`}
        >
          <div>
            <p
              className={` text-xl leading-relaxed ${styles.clippingText}`}
            >
              {c.content}
            </p>
          </div>
          <div className='flex justify-between items-center'>
            <div className='flex items-center '>
              <SimpleAvatar avatar={c.creator.avatar} />
              <span className='ml-2'>{c.creator.name}</span>
            </div>
            <div className='ml-4'>
              <span className='text-right'>{c.title}</span>
            </div>
          </div>
        </Link>
      ))}
      </div>
    </div>
  )
}

export default TopClippings
