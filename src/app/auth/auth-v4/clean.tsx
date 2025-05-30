'use client'
import { onCleanServerCookie } from '@/components/navigation-bar/logout'
import profile from '@/utils/profile'
import { useEffect } from 'react'

function ForceClean() {
  useEffect(() => {
    const isForceClean = window.location.search.includes('clean')
    if (!isForceClean) {
      return
    }
    onCleanServerCookie()
    profile.onLogout()
  }, [])
  return null
}

export default ForceClean
