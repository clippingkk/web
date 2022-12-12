import { Blockquote, Divider, HoverCard, Rating, Title, Tooltip } from '@mantine/core'
import React, { useEffect, useMemo, useState } from 'react'
import TextTransition, { presets } from "react-text-transition"
import { fetchYearlyReport_reportYearly_books } from '../../schema/__generated__/fetchYearlyReport'
import { WenquBook } from '../../services/wenqu'
import PublicBookItem from '../public-book-item/public-book-item'

type ReportBookSectionProps = {
    book: WenquBook
    reportDataBook?: fetchYearlyReport_reportYearly_books
}

function ReportBookSection(props: ReportBookSectionProps) {
    const containerStyle = useMemo<React.CSSProperties | undefined>(() => {
        return {
            // backgroundImage: `url(https://picsum.photos/${width}/${height}/?blur=10)`
            backgroundImage: `url(${props.book.image})`,
        }
    }, [props.book.image])

    const [currentClippingIdx, setCurrentClippingIdx] = useState(0)

    useEffect(() => {
        const t = setInterval(() => {
            const maxLen = props.reportDataBook?.clippings.length ?? 0
            setCurrentClippingIdx(prev => {
                const n = prev + 1
                if (n >= maxLen) {
                    return 0
                }
                return n
            })
        }, 10_000)
        return () => {
            clearInterval(t)
        }
    }, [props.reportDataBook])

    return (
        <div className='container mx-auto flex flex-col'>
            <div className='flex'>
                <PublicBookItem book={props.book} />
                <div className=' w-1/2 dark:text-white text-gray-900'>
                    <Title order={2} className=''>
                        {props.book.title}
                    </Title>
                    <Rating value={props.book.rating / 2} readOnly className='my-4' />
                    <span>{props.book.author}</span>
                    <Divider className='my-10' />
                    <HoverCard width={560} shadow='lg'>
                        <HoverCard.Target>
                            <p className=' line-clamp-6'>
                                {props.book.summary}
                            </p>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <p className=' leading-6 '>
                                {props.book.summary}
                            </p>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </div>
            </div>

            <div>
                <TextTransition
                    springConfig={presets.wobbly}
                >
                    <Blockquote
                        className='font-lxgw text-lg md:text-3xl 2xl:text-6xl leading-loose'
                        classNames={{
                            body: 'leading-loose'
                        }}
                    >
                        {props.reportDataBook?.clippings[currentClippingIdx].content}
                    </Blockquote>
                </TextTransition>

            </div>
        </div>
    )
}

export default ReportBookSection
