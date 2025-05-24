'use client'
import { useTranslation } from '@/i18n/client'
import React, { useCallback, useRef, useState } from 'react'
import { useWebWidgetScript } from '../../hooks/widget'

function FeatureWidget() {
  const { t } = useTranslation()

  useWebWidgetScript()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [perspective, setPerspective] = useState(900)

  const containerDOM = useRef<HTMLDivElement | null>(null)
  const contentDOM = useRef<HTMLDivElement | null>(null)

  // https://codesandbox.io/s/7mp5pjp00j?file=/src/index.js
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!contentDOM.current) {
        return
      }
      // perf: please do not do calcute every mouse move
      const textDimensions = containerDOM.current?.getBoundingClientRect()
      const cursorPositionInsideText = {
        x: e.clientX - Math.round(textDimensions?.left ?? 0),
        y: e.clientY - Math.round(textDimensions?.top ?? 0),
      }

      const deg = {
        x:
          3.5 *
          ((cursorPositionInsideText.x / (textDimensions?.width ?? 1)) * 2 - 1),
        y:
          3.5 *
          ((cursorPositionInsideText.y / (textDimensions?.height ?? 1)) * 2 -
            1),
      }

      contentDOM.current.style.transform = `rotateX(${-deg.y}deg)  rotateY(${deg.x}deg)`
    },
    []
  )

  return (
    <div
      className="flex w-full flex-col items-center justify-around py-16 lg:flex-row lg:py-64"
      onMouseMove={onMouseMove}
    >
      <div
        ref={containerDOM}
        style={{
          perspective,
        }}
      >
        <div
          ref={contentDOM}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(0deg) rotateY(0deg)',
          }}
        >
          {/* widget start */}
          <blockquote className="ck-clipping-card" data-cid="20420">
            <p lang="zh" dir="ltr" className="ck-content">
              我在想：“什么是地狱？”我认为，地狱就是“再也不能爱”这样的痛苦
            </p>
            <p className="ck-author">
              —— 《卡拉马佐夫兄弟》 <small>[俄]费奥多尔·陀思妥耶夫斯基</small>
            </p>
            <p className="ck-info">
              <span>AnnatarHe</span> 摘录于 <time>2021-12-13T14:01:17Z</time>
            </p>
          </blockquote>
          {/* widget end */}
        </div>
      </div>

      <div className="flex flex-col items-center lg:items-start">
        <h3
          className={
            'font-lxgw mb-8 flex overflow-x-visible bg-linear-to-br from-orange-300 to-blue-300 bg-clip-text pb-4 text-center text-4xl font-bold text-transparent lg:mb-0 lg:text-7xl'
          }
        >
          {t('app.index.features.open.f4')}
        </h3>
        <span className="block text-center dark:text-gray-100">
          {t('app.index.features.open.f4Desc')}
        </span>
      </div>
    </div>
  )
}

export default FeatureWidget
