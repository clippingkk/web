import { Sparkles } from 'lucide-react'

import { getTranslation } from '@/i18n'

async function Layout(props: { children: React.ReactNode }) {
  const { t } = await getTranslation()
  return (
    <>
      <header className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-64 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        >
          <div className="absolute top-0 -left-16 h-56 w-56 rounded-full bg-blue-400/25 blur-3xl dark:bg-blue-400/20" />
          <div className="absolute top-4 right-0 h-64 w-72 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/15" />
          <div className="absolute top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-400/15" />
        </div>

        <svg
          aria-hidden
          viewBox="0 0 1200 260"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent)] opacity-70 dark:opacity-40"
        >
          <defs>
            <linearGradient
              id="square-hero-quote-gradient"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient
              id="square-hero-line-gradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g
            stroke="url(#square-hero-line-gradient)"
            strokeWidth="1"
            strokeDasharray="2 6"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M80 140 L280 70 L470 160 L660 50 L880 150 L1110 90" />
            <path d="M120 210 L340 180 L540 220 L760 170 L980 210" />
          </g>

          <g fill="url(#square-hero-quote-gradient)">
            <circle cx="80" cy="140" r="3" />
            <circle cx="280" cy="70" r="2.5" />
            <circle cx="470" cy="160" r="3.5" />
            <circle cx="660" cy="50" r="2.5" />
            <circle cx="880" cy="150" r="3" />
            <circle cx="1110" cy="90" r="2.5" />
            <circle cx="340" cy="180" r="2" />
            <circle cx="540" cy="220" r="2.5" />
            <circle cx="760" cy="170" r="2" />
            <circle cx="980" cy="210" r="3" />
          </g>

          <g
            stroke="url(#square-hero-quote-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path
              d="M180 95 q-14 0 -14 14 v18 h18 v-18 h-14 q0 -8 10 -10 z M210 95 q-14 0 -14 14 v18 h18 v-18 h-14 q0 -8 10 -10 z"
              transform="rotate(-12 195 112)"
              opacity="0.75"
            />
            <path
              d="M720 80 q-14 0 -14 14 v18 h18 v-18 h-14 q0 -8 10 -10 z M750 80 q-14 0 -14 14 v18 h18 v-18 h-14 q0 -8 10 -10 z"
              transform="rotate(8 735 97) scale(1.35)"
              opacity="0.65"
            />
            <path
              d="M1010 180 q-10 0 -10 10 v12 h12 v-12 h-10 q0 -5 8 -7 z M1030 180 q-10 0 -10 10 v12 h12 v-12 h-10 q0 -5 8 -7 z"
              transform="rotate(-6 1020 192) scale(0.9)"
              opacity="0.7"
            />
          </g>
        </svg>

        <div className="flex flex-col items-center justify-center px-6 py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-500 uppercase ring-1 ring-blue-400/25 dark:bg-blue-400/15 dark:text-blue-300 dark:ring-blue-400/30">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
            {t('app.square.eyebrow')}
          </span>

          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            <span className="inline-block bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text pb-1 text-transparent">
              {t('app.menu.square')}
            </span>
          </h2>

          <p className="mt-3 max-w-xl text-center text-sm text-slate-500 md:text-base dark:text-slate-400">
            {t('app.square.subtitle')}
          </p>

          <div
            aria-hidden
            className="mx-auto mt-8 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
          />
        </div>
      </header>

      <div className="mt-4 md:mt-6">{props.children}</div>
    </>
  )
}

export default Layout
