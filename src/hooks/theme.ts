'use client'
import { useState } from 'react'
import { bgs } from './theme.config'

export function useBackgroundImage() {
  const [bgIdx] = useState(() => Math.floor(Math.random() * bgs.length))
  return bgs[bgIdx]
}
