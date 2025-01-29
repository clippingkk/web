import React from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import FeaturesOpen from './Features-Open'
import FeatureWidget from './Feature-Widget'
import FeatureModern from './Feature-Modern'
import FeatureSense from './Feature-Sense'
import FeatureReborn from './Feature-Reborn'

type featureColorPattern = {
  title: string[]
  rows: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const colorPatterns: featureColorPattern[] = [
  {
    title: [
      'from-green-400',
      'to-blue-500',
      'bg-clip-text',
      'text-transparent',
      'bg-gradient-to-r'
    ],
    rows: [
      'from-green-400 to-orange-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-orange-400 to-teal-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-teal-400 to-pink-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-purple-400 to-orange-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-green-400 to-orange-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-green-400 to-orange-400 bg-clip-text text-transparent bg-gradient-to-r ',
    ]
  }, {
    title: [
      'from-red-400',
      'to-pink-500',
      'bg-clip-text',
      'text-transparent',
      'bg-gradient-to-r'
    ],
    rows: [
      'from-blue-300 to-orange-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-orange-400 to-pink-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-pink-400 to-red-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-purple-400 to-indigo-400 bg-clip-text text-transparent bg-gradient-to-r ',
    ]
  }, {
    title: [
      'from-indigo-400',
      'to-purple-500',
      'bg-clip-text',
      'text-transparent',
      'bg-gradient-to-r'
    ],
    rows: [
      'from-blue-400 to-indigo-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-green-400 to-indigo-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-orange-400 to-indigo-400 bg-clip-text text-transparent bg-gradient-to-r ',
      'from-purple-400 to-indigo-400 bg-clip-text text-transparent bg-gradient-to-r ',
    ]
  }
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
function FeatureSection(props: FeatureSectionType) {
  return (
    <div className='flex items-center w-full justify-around py-16 lg:flex-row flex-col'>
      <h3 className={'lg:text-7xl text-4xl text-center max-w-xs mb-8 lg:mb-0 pb-4 flex overflow-x-visible ' + props.colorPattern.title.join(' ')}>
        {props.title}
      </h3>
      <ul className='text-3xl lg:text-6xl lg:ml-12 ml-6'>
        {props.items.map(((x, i) => (
          <li key={x.feature} className='mb-10'>
            {x.link ? (
              <a
                href={x.link}
                target='_blank'
                className={props.colorPattern.rows[i] + ' hover:underline'}
                rel="noreferrer"
              >
                {x.feature}
                <ArrowTopRightOnSquareIcon className=' text-blue-400 h-4 w-4 lg:h-5 lg:w-5 inline-block mb-2 lg:mb-8' />
              </a>
            ) : (
              <h4 className={props.colorPattern.rows[i]}>
                {x.feature}
              </h4>
            )}
            {x.desc && (
              <h6 className={props.colorPattern.rows[i] + ' text-base mt-4'}>
                {x.desc}
              </h6>
            )}
            {x.block}
          </li>
        )))}
      </ul>
    </div>
  )
}

function Features() {
  return (
    <div className='w-full flex justify-center flex-col p-10'>
      <h2 className='text-3xl text-center dark:text-gray-100 text-slate-900'>Feature List</h2>
      <FeaturesOpen />
      {/* <FeatureSection
        title={t('app.index.features.open.title')}
        colorPattern={colorPatterns[0]}
        items={[{
          feature: t('app.index.features.open.f1'),
          link: 'https://www.bilibili.com/video/BV1Tg411G7gG'
        }, {
          feature: t('app.index.features.open.f2'),
          link: 'https://annatarhe.notion.site/flomo-170afd99f866403d922a363b5b1b7706',
          desc: t('app.index.features.open.f2Desc'),
        }, {
          feature: t('app.index.features.open.f3'),
          link: 'https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae'
        }, {
          feature: t('app.index.features.open.f4'),
          link: 'https://web-widget-script.pages.dev/',
          desc: t('app.index.features.open.f4Desc'),
        }]}
      /> */}
      <FeatureWidget />
      <FeatureModern />
      {/* <FeatureSection
        colorPattern={colorPatterns[1]}
        title={t('app.index.features.modern.title')}
        items={[{
          feature: t('app.index.features.modern.f1'),
          desc: t('app.index.features.modern.f1Desc'),
        }, {
          feature: t('app.index.features.modern.f2'),
          desc: t('app.index.features.modern.f2Desc'),
        }, {
          feature: t('app.index.features.modern.f3'),
          desc: t('app.index.features.modern.f3Desc'),
        }]}
      /> */}
      <FeatureSense />
      {/* <FeatureSection
        colorPattern={colorPatterns[2]}
        title={t('app.index.features.sense.title')}
        items={[{
          feature: t('app.index.features.sense.f1'),
          link: 'https://apps.apple.com/us/app/clippingkk/id1537830952',
          desc: t('app.index.features.sense.f1Desc'),
        }, {
          feature: t('app.index.features.sense.f2'),
          desc: t('app.index.features.sense.f2Desc'),
        }, {
          feature: t('app.index.features.sense.f3'),
          desc: t('app.index.features.sense.f3Desc'),
        }]}
      /> */}
      <FeatureReborn />
      {/* <FeatureSection
        colorPattern={colorPatterns[0]}
        title={t('app.index.features.reading4.title')}
        items={[{
          feature: t('app.index.features.reading4.f1'),
          desc: t('app.index.features.reading4.f1Desc'),
        }, {
          feature: t('app.index.features.reading4.f2'),
          desc: t('app.index.features.reading4.f2Desc'),
        }, {
          feature: t('app.index.features.reading4.f3'),
          desc: t('app.index.features.reading4.f3Desc'),
          link: 'https://github.com/clippingkk/cli'
        }, {
          feature: t('app.index.features.reading4.f4'),
          desc: t('app.index.features.reading4.f4Desc'),
        }]}
      /> */}
    </div>
  )
}


export default Features
