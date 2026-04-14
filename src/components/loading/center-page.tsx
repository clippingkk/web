function CenterPageLoading() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <div className="h-156 w-full max-w-md animate-pulse rounded-2xl border border-white/40 bg-gradient-to-br from-blue-400/10 via-slate-200/60 to-indigo-400/10 backdrop-blur-xl dark:border-slate-800/40 dark:from-blue-400/5 dark:via-slate-800/50 dark:to-indigo-400/5" />
    </div>
  )
}

export default CenterPageLoading
