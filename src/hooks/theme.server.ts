import { connection } from 'next/server'
import { bgs } from './theme.config'

export async function getBackgroundImageServer() {
  // Opt out of static generation since we need dynamic random selection
  await connection()
  const idx = Math.floor(Math.random() * bgs.length)
  return bgs[idx]
}
