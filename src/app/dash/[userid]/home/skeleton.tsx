export function BooksSkeleton() {
  return (
    <div className="mt-16 mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {new Array(6).fill(1).map((_, i) => (
        <div
          key={i}
          className="h-96 w-full animate-pulse bg-gray-300 dark:bg-gray-800"
        />
      ))}
    </div>
  )
}

function HomePageSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="mt-12 h-96 w-full animate-pulse bg-gray-300 dark:bg-gray-800" />
      <div className="mt-12 h-32 w-full animate-pulse bg-gray-300 dark:bg-gray-800" />
      <BooksSkeleton />
    </div>
  )
}

export default HomePageSkeleton
