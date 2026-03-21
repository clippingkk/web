export function PulseLoader() {
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-400"></div>
        <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-blue-400"></div>
      </div>
    </div>
  )
}
