function Loading() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-6 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-400/10"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-400/10"
      />

      <output
        aria-live="polite"
        className="relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/70 bg-white/70 px-8 py-10 text-center shadow-xl shadow-blue-950/5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-black/20"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/25">
          <span className="text-2xl font-black text-white" aria-hidden="true">
            CK
          </span>
        </div>

        <h1 className="font-lato text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          ClippingKK
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Preparing your reading space…
        </p>

        <div
          aria-hidden="true"
          className="mt-7 h-8 w-8 animate-spin rounded-full border-3 border-blue-400/20 border-t-blue-500"
        />
        <span className="sr-only">Loading ClippingKK</span>
      </output>
    </main>
  )
}

export default Loading
