'use client'
import { useEffect } from 'react'
import { onCleanServerCookie } from '@/components/navigation-bar/logout'
import profile from '@/utils/profile'

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
