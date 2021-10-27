import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLinkIcon } from '@heroicons/react/solid'

type featureColorPattern = {
  title: string[]
  rows: string[]
}

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
      'text-green-400',
      'text-green-600',
      'text-green-400',
      'text-green-600',
      'text-green-400',
      'text-green-600',
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
      'text-blue-400',
      'text-blue-600',
      'text-blue-400',
      'text-blue-600',
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
      'text-indigo-400',
      'text-indigo-600',
      'text-indigo-800',
      'text-indigo-900',
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

function FeatureSection(props: FeatureSectionType) {
  return (
    <div className='flex items-center w-full justify-around py-16 lg:flex-row flex-col'>
      <h3 className={'lg:text-8xl text-4xl text-center max-w-xs mb-8 lg:mb-0 pb-4 flex overflow-x-visible ' + props.colorPattern.title.join(' ')}>
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
                <ExternalLinkIcon className=' h-4 w-4 lg:h-5 lg:w-5 inline-block mb-2 lg:mb-8' />
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
  const { t } = useTranslation()
  return (
    <div className='w-full flex justify-center flex-col p-10'>
      <h2 className='text-3xl text-center dark:text-gray-100'>Feature List</h2>
      <FeatureSection
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
      />
      <FeatureSection
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
      />
      <FeatureSection
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
      />
      <FeatureSection
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
      />
    </div>
  )
}


export default Features
