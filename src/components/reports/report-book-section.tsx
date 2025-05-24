import Tooltip from '@annatarhe/lake-ui/tooltip'
import autoAnimate from '@formkit/auto-animate'

import { useTranslation } from '@/i18n/client'
import { useEffect, useRef, useState } from 'react'
import { FetchYearlyReportQuery } from '../../schema/generated'
import { WenquBook } from '../../services/wenqu'
import PublicBookItem from '../public-book-item/public-book-item'
import Rating from '../rating'

type ReportBookSectionProps = {
  book: WenquBook
  reportDataBook?: FetchYearlyReportQuery['reportYearly']['books'][0]
}

function ReportBookSection(props: ReportBookSectionProps) {
  const { t } = useTranslation()
  const [currentClippingIdx, setCurrentClippingIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      const maxLen = props.reportDataBook?.clippings.length ?? 0
      setCurrentClippingIdx((prev) => {
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

  const cksDOM = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!cksDOM.current) {
      return
    }
    autoAnimate(cksDOM.current)
  }, [])

  const currentClipping = props.reportDataBook?.clippings[currentClippingIdx]

  return (
    <div className="container mx-auto flex flex-col py-8">
      <div className="flex flex-col justify-center lg:flex-row">
        <div className="mx-auto w-72 lg:mr-8 lg:ml-0">
          <PublicBookItem book={props.book} />
        </div>
        <div className="w-full px-10 text-gray-900 lg:w-1/2 lg:px-0 dark:text-white">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-4xl dark:text-white">
            {props.book.title}
          </h2>
          <Rating rating={props.book.rating / 2} className="my-4" />
          <span>{props.book.author}</span>
          <h4 className="mt-1 text-sm font-normal text-gray-700 lg:mt-4 lg:text-base dark:text-gray-300">
            {t('app.report.clippingCountOnBook', {
              count: props.reportDataBook?.clippingsCount,
            })}
          </h4>
          <hr className="my-4 lg:my-10" />
          <Tooltip content={props.book.summary}>
            <p className="line-clamp-6 text-sm lg:text-base">
              {props.book.summary}
            </p>
          </Tooltip>
        </div>
      </div>

      <div className="lg:px-auto container mt-6 px-10 pb-4" ref={cksDOM}>
        {currentClipping && (
          <div
            key={currentClipping.id}
            // springConfig={presets.default}
            className="font-lxgw text-lg leading-loose! md:text-3xl 2xl:text-5xl dark:text-white"
          >
            {currentClipping.content}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportBookSection
