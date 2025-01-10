import { bgs } from './theme.config'

export function useBackgroundImageServer() {
  const idx = Math.floor(Math.random() * bgs.length)
  return bgs[idx]
}
