import { Book, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

import FreePlanFeatures from '@/components/pricing/free-plan-features'
import PlanCard from '@/components/pricing/plan-card'
import PremiumPlanFeatures from '@/components/pricing/premium-plan-features'
import { checkIsPremium } from '@/compute/user'
import { getTranslation } from '@/i18n'
import type { ProfileQuery } from '@/schema/generated'

type PricingContentProps = {
  profile?: ProfileQuery['me'] | null
  checkoutUrl?: string
}

async function PricingContent(props: PricingContentProps) {
  const { profile, checkoutUrl } = props
  const { t } = await getTranslation(undefined, 'pricing')

  const isPremium = checkIsPremium(profile?.premiumEndAt)

  return (
    <div className="relative min-h-screen w-full">
      {/* Decorative gradient orbs, retuned to the unified blue/indigo palette */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-pulse-slow absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/25 to-indigo-500/20 opacity-30 blur-[120px]" />
        <div className="absolute right-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-500/15 opacity-30 blur-[100px]" />
        <div className="animate-pulse-slow-reverse absolute top-1/3 -right-24 h-[300px] w-[300px] rounded-full bg-gradient-to-bl from-indigo-400/20 to-blue-500/10 opacity-25 blur-[80px]" />
        <div className="absolute bottom-0 left-10 h-[200px] w-[200px] rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-400/10 opacity-20 blur-[80px]" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-300" />
            <span className="text-sm font-medium tracking-wide text-blue-600 dark:text-blue-300">
              {t('unlock')}
            </span>
          </div>

          <h2 className="mb-6 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl">
            {t('title')}
          </h2>

          <p className="mx-auto w-full max-w-3xl text-lg leading-relaxed font-light text-slate-600 md:text-xl dark:text-slate-300">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing cards - Enhanced layout */}
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 md:gap-16 lg:grid-cols-2">
          {/* Decorative elements connecting the cards */}
          <div className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 transform items-center justify-center lg:flex">
            <div className="relative">
              <div className="animate-ping-slow absolute inset-0 rounded-full bg-blue-400/10" />
              <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-500/20 blur-sm" />
              <div className="relative z-10 rounded-full bg-blue-400/10 p-3 ring-1 ring-blue-400/20 backdrop-blur-sm">
                <ChevronRight className="h-10 w-10 text-blue-500/80 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <PlanCard
            title={t('plan.free.name')}
            description={t('plan.free.description')}
            plan="free"
            features={
              <FreePlanFeatures>
                <div className="w-full justify-center">
                  <Link
                    href={
                      profile?.id ? `/dash/${profile.id}/home` : '/auth/auth-v4'
                    }
                    className="group relative z-10 inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-400 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-blue-400/30 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-400/50 active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t('plan.free.goto')}
                    </span>
                    {/* Hover overlay */}
                    <span className="absolute inset-0 z-0 bg-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                    {/* Glow effect */}
                    <span className="absolute -inset-1 z-0 scale-[1.15] rounded-xl bg-blue-400 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-40"></span>
                    {/* Shine effect */}
                    <span className="absolute inset-0 z-0 translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transition-transform duration-1000 group-hover:translate-x-[-300%]"></span>
                  </Link>
                </div>
              </FreePlanFeatures>
            }
          />

          <PlanCard
            title={
              <h2 className="bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 bg-clip-text text-5xl font-bold text-transparent">
                {t('plan.premium.name')}
              </h2>
            }
            plan="premium"
            description={t('plan.premium.description')}
            features={
              <PremiumPlanFeatures>
                <div className="w-full">
                  {isPremium ? (
                    <Link
                      href={`/dash/${profile?.id}/home`}
                      className="group relative z-10 inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-400 px-6 py-5 text-lg font-bold text-white shadow-xl shadow-blue-400/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-400/60 active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        {t('go')}
                      </span>
                      <span className="absolute inset-0 z-0 bg-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                      {/* Glow effect */}
                      <span className="absolute -inset-1 z-0 scale-[1.15] rounded-xl bg-blue-400 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-60"></span>
                      {/* Animated accent */}
                      <span className="absolute -top-1 -right-1 h-16 w-16 rotate-45 bg-white/20 transition-all duration-700 group-hover:scale-150 group-hover:opacity-100"></span>
                    </Link>
                  ) : (
                    <Link
                      href={(checkoutUrl ?? '/auth/auth-v4') as any}
                      className="group relative z-10 inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-500/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/60 active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {t('plan.premium.goto')}
                      </span>
                      <span className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                      <span className="absolute -inset-1 z-0 scale-[1.15] rounded-xl bg-indigo-500 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-70"></span>
                      {/* Particle effect */}
                      <span className="absolute inset-0">
                        <span className="absolute top-0 left-1/4 h-2 w-2 rounded-full bg-white opacity-0 transition-all duration-300 group-hover:animate-ping group-hover:opacity-60"></span>
                        <span className="absolute top-1/3 left-3/4 h-1.5 w-1.5 rounded-full bg-white opacity-0 transition-all duration-500 group-hover:animate-ping group-hover:opacity-60"></span>
                        <span className="absolute bottom-1/4 left-1/2 h-2 w-2 rounded-full bg-white opacity-0 transition-all duration-700 group-hover:animate-ping group-hover:opacity-60"></span>
                      </span>
                      {/* Shine effect */}
                      <span className="absolute inset-0 z-0 translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transition-transform duration-1000 group-hover:translate-x-[-300%]"></span>
                    </Link>
                  )}
                </div>
              </PremiumPlanFeatures>
            }
          />
        </div>

        {/* FAQ / Contact */}
        <div className="mt-24 text-center">
          <div className="relative mx-auto mb-10 max-w-md">
            <div className="absolute inset-0 flex items-center">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <span className="rounded-full bg-blue-400/10 px-4 py-1 text-sm font-medium text-blue-600 ring-1 ring-blue-400/20 backdrop-blur-sm dark:text-blue-300">
                {t('help')}
              </span>
            </div>
          </div>

          <p className="mb-6 text-lg text-slate-600 md:text-xl dark:text-slate-300">
            {t('questions')}
          </p>

          <a
            href="mailto:annatar.he+clippingkk@gmail.com"
            className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-6 py-3 font-medium text-blue-600 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-400/15 hover:shadow-md hover:shadow-blue-400/20 dark:text-blue-300"
            referrerPolicy="no-referrer"
          >
            annatar.he+clippingkk@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default PricingContent
