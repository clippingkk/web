function Loading() {
  return (
    <div className="container mt-4 w-full lg:mt-20">
      <div className="flex h-156 w-full flex-col gap-6 px-4 lg:flex-row">
        <div className="h-32 flex-1 animate-pulse rounded-xs bg-slate-400 lg:h-full" />
        <div className="h-24 animate-pulse rounded-xs bg-slate-400 lg:h-full lg:w-96" />
      </div>
      <div className="w-full px-4">
        <div className="mt-12 mb-8 h-64 w-full animate-pulse rounded-xs bg-slate-400" />
      </div>
    </div>
  )
}

export default Loading
