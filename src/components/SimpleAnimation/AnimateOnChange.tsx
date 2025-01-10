/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import { animations } from './theme'

type AnimateOnChangeProps = {
  className?: string
  durationOut?: number
  animation?: string
  animationIn?: string
  animationOut?: string
  style?: React.CSSProperties
  children: React.ReactElement
}

function AnimateOnChange(props: AnimateOnChangeProps) {
  const {
    animation: animationBaseName,
    children,
    className,
    durationOut,
    style,
    animationIn = `${animationBaseName}In`,
    animationOut = `${animationBaseName}Out`,
  } = props
  const [animation, setAnimation] = useState('')
  const [displayContent, setDisplayContent] = useState(children)
  const firstUpdate = useRef(true)

  useEffect(() => {
    // Don't run the effect the first time through
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }
    setAnimation('out')
  }, [children])

  const showDisplayContent = () => {
    if (animation === 'out') {
      setAnimation('in')
      setDisplayContent(children)
    }
  }

  const styles = {
    display: 'inline-block',
    transition: !className && `opacity ${durationOut}ms ease-out`,
    opacity: !className && animation === 'out' ? 0 : 1,
    animationDuration: durationOut + 'ms',
    ...style
  }

  switch (animation) {
    case 'in':
      styles.animation = (animations as any)[animationIn] || animationIn
      break
    case 'out':
      styles.animation = (animations as any)[animationOut] || animationOut
      break
  }

  const baseClassName = className || 'animate-on-change'
  return (
    <span
      onTransitionEnd={showDisplayContent}
      onAnimationEnd={showDisplayContent}
      className={`${baseClassName} ${baseClassName}-${animation}`}
      style={styles as any}
    >
      {displayContent}
    </span>
  )
}

export default AnimateOnChange
