import React from 'react'

function BookPageSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Book info section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
        {/* Book cover and details */}
        <div className="space-y-4">
          {/* Book cover skeleton */}
          <div className="w-full h-96 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-2xl shadow-sm"></div>
          
          {/* Action buttons skeleton */}
          <div className="space-y-3">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-xl"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg"></div>
          </div>
        </div>
        
        {/* Book info content */}
        <div className="space-y-6">
          {/* Title and author */}
          <div className="space-y-3">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-3/4"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-1/2"></div>
          </div>
          
          {/* Rating and badges */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-300 dark:bg-zinc-600 rounded-full"></div>
              ))}
            </div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full w-16"></div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-full"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-5/6"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-4/5"></div>
          </div>
          
          {/* Stats section */}
          <div className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/40 dark:border-zinc-700/40">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-12 mx-auto"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Elegant divider */}
      <div className="relative h-px my-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/25 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
      </div>

      {/* Clippings section skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-32"></div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg w-24"></div>
        </div>
        
        {/* Clippings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {new Array(6).fill(1).map((_, i) => (
            <div
              key={i}
              className="bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30 dark:border-zinc-700/30 space-y-3"
            >
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-full"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-5/6"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-4/5"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-16"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-600 rounded w-6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookPageSkeleton
