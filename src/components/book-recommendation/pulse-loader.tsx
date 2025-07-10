import React from 'react'

export function PulseLoader() {
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
      </div>
    </div>
  )
}