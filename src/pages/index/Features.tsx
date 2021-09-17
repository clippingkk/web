import React from 'react'

type featureColorPattern = {
  title: string[]
  rows: string[]
}

const colorPatterns: featureColorPattern[] = [{
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
    'text-green-800',
    'text-green-900',
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
    'text-blue-800',
    'text-blue-900',
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

}]

type FeatureSectionType = {
  title: string
  items: {
    feature: string
    desc?: string
    block?: React.ReactElement
  }[]
  colorPattern: featureColorPattern
}

function FeatureSection(props: FeatureSectionType) {
  return (
    <div className='flex items-center w-full justify-around py-16'>
      <h3 className={'text-8xl overflow-visible text-center max-w-xs ' + props.colorPattern.title.join(' ')}>
        {props.title}
      </h3>
      <ul className='text-6xl ml-12'>
        {props.items.map(((x, i) => (
          <li key={x.feature} className='mb-10'>
            <h4 className={props.colorPattern.rows[i]}>
              {x.feature}
            </h4>
            {x.desc && (
              <h6 className='text-base'>
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
      <h2 className='text-3xl text-center dark:text-gray-100'>Feature List</h2>
      <FeatureSection
        title='Open'
        colorPattern={colorPatterns[0]}
        items={[{
          feature: 'Export To Notion'
        }, {
          feature: 'Export To Flomo'
        }, {
          feature: 'Webhook'
        }, {
          feature: 'Web widget',
          desc: '支持在任意外部网站引用你的读书笔记 (除非微信屏蔽 狗头)',
          block: (<p>preview image here</p>)
        }]}
      />
      <FeatureSection
        colorPattern={colorPatterns[1]}
        title='Modern'
        items={[{
          feature: 'Arch'
        }, {
          feature: 'Code'
        }, {
          feature: 'Mind: the most important thing'
        }]}
      />
      <FeatureSection
        colorPattern={colorPatterns[2]}
        title='Sense'
        items={[{
          feature: 'iOS widget'
        }, {
          feature: 'Privacy'
        }, {
          feature: 'Comminicate'
        }]}
      />
      <FeatureSection
        colorPattern={colorPatterns[0]}
        title='Make Reading Greate Aagain'
        items={[{
          feature: 'platforms'
        }, {
          feature: 'close to user'
        }, {
          feature: 'free'
        }]}
      />
    </div>
  )
}


export default Features
