import { Blockquote, Divider, HoverCard, Rating, Title, Tooltip } from '@mantine/core'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TextTransition, { presets } from "react-text-transition"
import { fetchYearlyReport_reportYearly_books } from '../../schema/__generated__/fetchYearlyReport'
import { WenquBook } from '../../services/wenqu'
import PublicBookItem from '../public-book-item/public-book-item'

type ReportBookSectionProps = {
    book: WenquBook
    reportDataBook?: fetchYearlyReport_reportYearly_books
}

function ReportBookSection(props: ReportBookSectionProps) {
    const { t } = useTranslation()
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
        <div className='container mx-auto flex flex-col py-8'>
            <div className='flex justify-center lg:flex-row flex-col'>
                <div className=' w-72 mx-auto lg:ml-0 lg:mr-8'>
                    <PublicBookItem book={props.book} />
                </div>
                <div className='w-full px-10 lg:px-0 lg:w-1/2 dark:text-white text-gray-900'>
                    <Title order={2} className=' text-2xl lg:text-4xl'>
                        {props.book.title}
                    </Title>
                    <Rating value={props.book.rating / 2} readOnly className='my-4' />
                    <span>{props.book.author}</span>
                    <Title
                        order={4}
                        className='mt-1 lg:mt-4 font-normal text-sm lg:text-base'
                    >
                        {t('app.report.clippingCountOnBook', { count: props.reportDataBook?.clippingsCount })}
                    </Title>
                    <Divider className='my-4 lg:my-10' />
                    <HoverCard width={560} shadow='lg'>
                        <HoverCard.Target>
                            <p className=' text-sm lg:text-base line-clamp-6'>
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

            <div className='mt-6 container px-10 lg:px-auto pb-4'>
                <TextTransition
                    springConfig={presets.default}
                    className='font-lxgw text-lg md:text-3xl 2xl:text-5xl !leading-loose dark:text-white'
                >
                    {props.reportDataBook?.clippings[currentClippingIdx].content}
                </TextTransition>
            </div>
        </div>
    )
}

export default ReportBookSection
