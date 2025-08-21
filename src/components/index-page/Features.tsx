import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import type React from 'react'
import FeatureModern from './Feature-Modern'
import FeatureReborn from './Feature-Reborn'
import FeatureSense from './Feature-Sense'
import FeatureWidget from './Feature-Widget'
import FeaturesOpen from './Features-Open'

type featureColorPattern = {
  title: string[]
  rows: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _colorPatterns: featureColorPattern[] = [
  {
    title: [
      'from-green-400',
      'to-blue-500',
      'bg-clip-text',
      'text-transparent',
      'bg-linear-to-r',
    ],
    rows: [
      'from-green-400 to-orange-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-orange-400 to-teal-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-teal-400 to-pink-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-purple-400 to-orange-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-green-400 to-orange-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-green-400 to-orange-400 bg-clip-text text-transparent bg-linear-to-r ',
    ],
  },
  {
    title: [
      'from-red-400',
      'to-pink-500',
      'bg-clip-text',
      'text-transparent',
      'bg-linear-to-r',
    ],
    rows: [
      'from-blue-300 to-orange-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-orange-400 to-pink-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-pink-400 to-red-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-purple-400 to-indigo-400 bg-clip-text text-transparent bg-linear-to-r ',
    ],
  },
  {
    title: [
      'from-indigo-400',
      'to-purple-500',
      'bg-clip-text',
      'text-transparent',
      'bg-linear-to-r',
    ],
    rows: [
      'from-blue-400 to-indigo-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-green-400 to-indigo-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-orange-400 to-indigo-400 bg-clip-text text-transparent bg-linear-to-r ',
      'from-purple-400 to-indigo-400 bg-clip-text text-transparent bg-linear-to-r ',
    ],
  },
]

type FeatureSectionType = {
  title: string
  items: {
    feature: string
    link?: string
    desc?: string
    block?: React.ReactElement
  }[]
  colorPattern: featureColorPattern
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _FeatureSection(props: FeatureSectionType) {
  return (
    <div className='flex w-full flex-col items-center justify-around py-16 lg:flex-row'>
      <h3
        className={
          'mb-8 flex max-w-xs overflow-x-visible pb-4 text-center text-4xl lg:mb-0 lg:text-7xl ' +
          props.colorPattern.title.join(' ')
        }
      >
        {props.title}
      </h3>
      <ul className='ml-6 text-3xl lg:ml-12 lg:text-6xl'>
        {props.items.map((x, i) => (
          <li key={x.feature} className='mb-10'>
            {x.link ? (
              <a
                href={x.link}
                target='_blank'
                className={`${props.colorPattern.rows[i]} hover:underline`}
                rel='noreferrer'
              >
                {x.feature}
                <ArrowTopRightOnSquareIcon className='mb-2 inline-block h-4 w-4 text-blue-400 lg:mb-8 lg:h-5 lg:w-5' />
              </a>
            ) : (
              <h4 className={props.colorPattern.rows[i]}>{x.feature}</h4>
            )}
            {x.desc && (
              <h6 className={`${props.colorPattern.rows[i]} mt-4 text-base`}>
                {x.desc}
              </h6>
            )}
            {x.block}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Features() {
  return (
    <div className='flex w-full flex-col justify-center'>
      <h2 className='text-center text-3xl text-slate-900 dark:text-gray-100'>
        Feature List
      </h2>
      <FeaturesOpen />
      <FeatureWidget
        widgetClippingData={{
          id: process.env.NODE_ENV === 'development' ? '21' : '20420',
          content:
            '我在想：“什么是地狱？”我认为，地狱就是“再也不能爱”这样的痛苦',
          book: '卡拉马佐夫兄弟',
          author: '费奥多尔·陀思妥耶夫斯基',
          location: '第12章',
          createdAt: '2021-12-13T14:01:17Z',
          creator: {
            id: '1',
            name: 'AnnatarHe',
            avatar: 'https://avatars.githubusercontent.com/u/8704175?v=4',
          },
        }}
      />
      <FeatureModern />
      <FeatureSense />
      <FeatureReborn />
    </div>
  )
}

export default Features
