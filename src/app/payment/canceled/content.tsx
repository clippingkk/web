import { ArrowRight, XCircle } from 'lucide-react'
import Link from 'next/link'

function CanceledPageContent() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-400/10 ring-1 ring-rose-400/20 dark:bg-rose-400/15">
        <XCircle className="h-10 w-10 text-rose-500 dark:text-rose-300" />
      </span>
      <h1 className="mb-2 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
        Payment canceled
      </h1>
      <p className="mb-8 text-slate-600 dark:text-slate-300">
        Sorry we could not process your payment. Please try again.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-400 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
      >
        Go to plans
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default CanceledPageContent
