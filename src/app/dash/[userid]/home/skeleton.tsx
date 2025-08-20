import React from 'react'

export function BooksSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-16 mb-16 gap-6">
      {new Array(6).fill(1).map((_, i) => (
        <div
          key={i}
          className="w-full h-96 animate-pulse bg-gray-300 dark:bg-gray-800"
        />
      ))}
    </div>
  )
}

function HomePageSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="mt-12 w-full h-96 animate-pulse bg-gray-300 dark:bg-gray-800" />
      <div className="mt-12 w-full h-32 animate-pulse bg-gray-300 dark:bg-gray-800" />
      <BooksSkeleton />
    </div>
  )
}

export default HomePageSkeleton
