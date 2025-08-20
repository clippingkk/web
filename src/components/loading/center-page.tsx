import React from 'react'

function CenterPageLoading() {
  return (
    <div className="container mx-auto h-screen flex items-center justify-center">
      <div className="h-156 w-128 animate-pulse bg-slate-400 dark:bg-slate-800" />
    </div>
  )
}

export default CenterPageLoading
