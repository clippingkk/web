import React from 'react'
import { FetchClippingQuery } from '../../schema/generated'
import { AppFeatures } from '../../constants/features'

type ContentSegmentProps = {
  noun?: FetchClippingQuery['clipping']['richContent']['nouns'][0]
  segment: string
  creatable?: boolean
  updatable?: boolean
  deletable?: boolean
  onNounAdd: (noun: string) => void
  onNounUpdate: (id: number, noun: string) => void
}

// const symbolList = new Set([
//   '、', '，', '。', '！', '@', '——', '【', '】', '的', '了', ':', '“', '”', '《', '》', '：'
// ])

function ContentSegment(props: ContentSegmentProps) {
  const {
    segment,
  } = props
  // const { t } = useTranslation()

  if (!AppFeatures.enableNounExplainer) {
    return <span>{segment}</span>
  }

  return <span>{segment}</span>

  // if (symbolList.has(segment)) {
  //   return <span>{segment}</span>
  // }


  // if (creatable && !noun) {
  //   return (
  //     <Popover
  //       withArrow
  //       transitionProps={{ transition: 'pop', duration: 125 }}
  //       width={300}
  //     >
  //       <Popover.Target>
  //         <span>{segment}</span>
  //       </Popover.Target>
  //       <Popover.Dropdown>
  //         <p className='w-full text-center text-xl'>{segment}</p>
  //         <p>{t('app.nouns.empty.tip')}</p>
  //         <div className='mt-4 flex justify-end'>
  //           <Button onClick={() => onNounAdd(segment)}>{t('app.nouns.empty.add')}</Button>
  //         </div>
  //       </Popover.Dropdown>
  //     </Popover>
  //   )
  // }

  // // 不能创建，而且也没有内容，暂时不知道咋操作，先不做
  // if (!noun) {
  //   return <span>{segment}</span>
  // }

  // return (
  //   <HoverCard
  //     transitionProps={{ transition: 'pop', duration: 125 }}
  //     arrowSize={14}
  //     withArrow
  //   >
  //     <HoverCard.Target>
  //       <span>{segment}</span>
  //     </HoverCard.Target>
  //     <HoverCard.Dropdown>
  //       <NounContentRender
  //         noun={noun}
  //         updatable={updatable}
  //         onUpdate={onNounUpdate} />
  //     </HoverCard.Dropdown>
  //   </HoverCard>
  // )
}

export default ContentSegment
