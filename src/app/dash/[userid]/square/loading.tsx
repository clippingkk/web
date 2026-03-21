function Loading() {
  return (
    <div className="container mx-auto">
      <div className="mt-16 mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {new Array(9).fill(1).map((_, i) => (
          <div
            key={i}
            className="h-96 w-full animate-pulse bg-gray-300 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  )
}

export default Loading
