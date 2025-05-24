import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import React from 'react'
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
const colorPatterns: featureColorPattern[] = [
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
function FeatureSection(props: FeatureSectionType) {
  return (
    <div className="flex w-full flex-col items-center justify-around py-16 lg:flex-row">
      <h3
        className={
          'mb-8 flex max-w-xs overflow-x-visible pb-4 text-center text-4xl lg:mb-0 lg:text-7xl ' +
          props.colorPattern.title.join(' ')
        }
      >
        {props.title}
      </h3>
      <ul className="ml-6 text-3xl lg:ml-12 lg:text-6xl">
        {props.items.map((x, i) => (
          <li key={x.feature} className="mb-10">
            {x.link ? (
              <a
                href={x.link}
                target="_blank"
                className={props.colorPattern.rows[i] + ' hover:underline'}
                rel="noreferrer"
              >
                {x.feature}
                <ArrowTopRightOnSquareIcon className="mb-2 inline-block h-4 w-4 text-blue-400 lg:mb-8 lg:h-5 lg:w-5" />
              </a>
            ) : (
              <h4 className={props.colorPattern.rows[i]}>{x.feature}</h4>
            )}
            {x.desc && (
              <h6 className={props.colorPattern.rows[i] + ' mt-4 text-base'}>
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
    <div className="flex w-full flex-col justify-center">
      <h2 className="text-center text-3xl text-slate-900 dark:text-gray-100">
        Feature List
      </h2>
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
