/**
 * fork from: https://github.com/cawfree/react-dark-mode-toggle/blob/master/src/index.js
 * 由于原版底层用了  lottie react web, 它写错了 peer dependencies
 * 原版自己也把 react 锁了版本写到了 dependencies 里
 * 导致无法支持 react ^17.0
 * 
 * 这里自己尝试使用 lottie-web 封装一层，结果搞不明白 lottie 的数据参数，失败了
 * 哪天心情好了再调整吧。用另一种方案替代
 * https://github.com/airbnb/lottie-web
 * 
 */

import Lottie, { AnimationItem } from 'lottie-web'
import React, { useEffect, useRef, useState } from 'react'
import parseUnit from 'parse-unit'

type DarkSwitcherProps = {
  size: number | string
  checked: boolean
  onChange: (checked: boolean) => void
  speed?: number
  className?: string
}

function DarkSwitcher(props: DarkSwitcherProps) {
  const { className, speed, onChange, checked, size } = props
  const lottieRef = useRef<AnimationItem | null>()
  const lottieDOMRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(() => 0)
  const [sizeValue, sizeUnit] = parseUnit(size)
  const segments = checked ? { segments: [2, 96] } : null
  useEffect(() => {
    // FIXME: 改不好了。放弃了

    // if (progress >= 0.5) {
    //   if (checked) {
    //     lottieRef.current?.pause();
    //   } else if (lottieRef.current?.isPaused) {
    //     lottieRef.current.play();
    //   }
    // } else if (!checked) {
    //   lottieRef.current?.pause();
    // }
  }, [checked, progress]);
  // useEffect(() => {
  //   (!!checked) && lottieRef.current?.goToAndStop(48);
  // }, [])

  useEffect(() => {
    if (!lottieDOMRef.current) {
      return
    }
    lottieRef.current = Lottie.loadAnimation({
      container: lottieDOMRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      animationData: require('./animationData.json'),
    });
    (window as any).lo = lottieRef.current

    function onEnterFrame({ currentTime, totalTime }: any) {
      setProgress(currentTime / totalTime)
    }

    lottieRef.current.addEventListener('enterFrame', onEnterFrame)
    return () => {
      lottieRef.current?.removeEventListener('enterFrame', onEnterFrame)
      lottieRef.current?.destroy()
      lottieRef.current = null
    }
  }, [])

  return (
    <button
      onClick={() => lottieRef.current?.isPaused && onChange(!checked)}
      style={{
        cursor: "pointer",
        overflow: "hidden",
        width: `${sizeValue}${sizeUnit || 'px'}`,
        height: `${sizeValue * 0.47}${sizeUnit || 'px'}`,
        appearance: 'none',
        MozAppearance: 'none',
        WebkitAppearance: 'none',
        border: 'none',
        backgroundColor: 'transparent',
        padding: 0,
      }}
      aria-hidden="true"
      className={className}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: `${sizeValue * -0.595}${sizeUnit || 'px'}`,
          marginLeft: `${sizeValue * -0.32}${sizeUnit || 'px'}`,
          width: `${sizeValue * 1.65}${sizeUnit || 'px'}`,
          height: `${sizeValue * 1.65}${sizeUnit || 'px'}`
        }}
      >
        <div
         ref={lottieDOMRef}
         style={{
           width: `${props.size || 85}px`,
           height: `${props.size || 85}px`
         }}
         />
      </div>
    </button>
  )
}

export default DarkSwitcher
