'use client'
import { useState, useEffect } from 'react'
import { bgs } from './theme.config'

export function useBackgroundImage() {
  const [bgIdx, setBgIdx] = useState(0)
  useEffect(() => {
    setBgIdx(Math.floor(Math.random() * bgs.length))
  }, [])
  return bgs[bgIdx]
}
