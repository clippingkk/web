import { BookOpen, Bookmark, Quote } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import PageShell from '@/components/ui/page-shell/page-shell'
import Surface from '@/components/ui/surface/surface'

import { AuthCardLoading } from './AuthCard'
import AuthContent, { type AuthPageProps } from './AuthContent'

export default function AuthPage({ searchParams }: AuthPageProps) {
  return (
    <main className="relative isolate flex min-h-svh items-center bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <DecorBlobs />
      <PageShell width="wide" animated={false}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-lg text-lg font-bold tracking-tight outline-offset-8 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <span className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 ring-1 ring-blue-500/15 dark:text-blue-300">
                <BookOpen aria-hidden className="size-6" />
              </span>
              ClippingKK
            </Link>
            <h1 className="mt-8 text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:mt-12 lg:text-6xl">
              Your best reading moments,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-400">
                together.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              A home for your books, highlights, and the ideas you want to keep.
              Pick up where your curiosity left off.
            </p>
            <Surface
              variant="muted"
              className="mt-10 hidden max-w-md p-6 lg:block"
            >
              <Quote
                aria-hidden
                className="mb-4 size-6 text-blue-500 dark:text-blue-300"
              />
              <p className="text-xl leading-relaxed font-medium">
                Keep the words that stay with you.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Bookmark aria-hidden className="size-4" />
                Your reading life, in one place
              </div>
            </Surface>
          </div>
          <Suspense fallback={<AuthCardLoading />}>
            <AuthContent searchParams={searchParams} />
          </Suspense>
        </div>
      </PageShell>
    </main>
  )
}
