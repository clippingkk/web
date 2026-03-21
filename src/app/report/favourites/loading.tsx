function Loading() {
  return (
    <div className="container mx-auto">
      <div className="mt-32 mb-16 grid grid-cols-3 gap-6">
        {new Array(6).fill(1).map((_, i) => (
          <div
            key={i}
            className="h-96 w-full animate-pulse bg-slate-400 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="h-32 w-32 animate-pulse rounded-full bg-slate-400 dark:bg-slate-800" />
        <div className="mt-4 h-12 w-96 animate-pulse bg-slate-400 dark:bg-slate-800" />
      </div>
    </div>
  )
}

export default Loading
