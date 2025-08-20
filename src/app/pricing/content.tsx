import { Book, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import FreePlanFeatures from '@/components/pricing/free-plan-features'
import PlanCard from '@/components/pricing/plan-card'
import PremiumPlanFeatures from '@/components/pricing/premium-plan-features'
import { checkIsPremium } from '@/compute/user'
import { useTranslation } from '@/i18n'
import type { ProfileQuery } from '@/schema/generated'

type PricingContentProps = {
  profile?: ProfileQuery['me'] | null
  checkoutUrl?: string
}

async function PricingContent(props: PricingContentProps) {
  const { profile, checkoutUrl } = props
  const { t } = await useTranslation(undefined, 'pricing')

  const isPremium = checkIsPremium(profile?.premiumEndAt)

  return (
    <div className="relative min-h-screen w-full">
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Top left gradient orb */}
        <div className="animate-pulse-slow absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-600/30 to-indigo-600/20 opacity-30 blur-[120px] filter"></div>
        {/* Bottom right gradient orb */}
        <div className="absolute right-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-cyan-600/25 to-blue-600/15 opacity-30 blur-[100px] filter"></div>
        {/* Accent gradient */}
        <div className="animate-pulse-slow-reverse absolute top-1/3 -right-24 h-[300px] w-[300px] rounded-full bg-gradient-to-bl from-fuchsia-500/20 to-pink-600/10 opacity-25 blur-[80px] filter"></div>
        {/* Additional small accent */}
        <div className="absolute bottom-0 left-10 h-[200px] w-[200px] rounded-full bg-gradient-to-tr from-cyan-400/20 to-emerald-500/10 opacity-20 blur-[80px] filter"></div>
        {/* Light texture overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-32">
        {/* Enhanced header section */}
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-2 shadow-lg shadow-indigo-500/5 backdrop-blur-sm">
            <Sparkles className="mr-2 h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium tracking-wide text-indigo-400">
              {t('unlock')}
            </span>
          </div>

          <h2 className="mb-8 bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-400 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl lg:text-7xl dark:from-indigo-400 dark:via-violet-400 dark:to-rose-300">
            {t('title')}
          </h2>

          <p className="mx-auto w-full max-w-3xl text-xl leading-relaxed font-light opacity-80 md:text-2xl dark:text-white">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing cards - Enhanced layout */}
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 md:gap-16 lg:grid-cols-2">
          {/* Decorative elements connecting the cards */}
          <div className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 transform items-center justify-center lg:flex">
            <div className="relative">
              {/* Pulsing circle behind the arrow */}
              <div className="animate-ping-slow absolute inset-0 rounded-full bg-indigo-500/10"></div>
              {/* Gradient ring around the arrow */}
              <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-sm"></div>
              {/* Arrow icon */}
              <div className="relative z-10 rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-3 backdrop-blur-sm">
                <ChevronRight className="h-10 w-10 text-indigo-500/70" />
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
                    className="group relative z-10 inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#045fab] px-6 py-4 text-xl font-bold text-white shadow-lg shadow-[#045fab]/30 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#045fab]/50 active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t('plan.free.goto')}
                    </span>
                    {/* Fancy hover effects */}
                    <span className="absolute inset-0 z-0 bg-[#0470c3] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                    {/* Glow effect */}
                    <span className="absolute -inset-1 z-0 scale-[1.15] rounded-xl bg-[#045fab] opacity-0 blur-xl transition-all duration-500 group-hover:opacity-40"></span>
                    {/* Shine effect */}
                    <span className="absolute inset-0 z-0 translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transition-transform duration-1000 group-hover:translate-x-[-300%]"></span>
                  </Link>
                </div>
              </FreePlanFeatures>
            }
          />

          <PlanCard
            title={
              <h2 className="bg-gradient-to-r from-amber-400 to-fuchsia-500 bg-clip-text text-5xl font-bold text-transparent">
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
                      className="group relative z-10 inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#045fab] px-6 py-5 text-lg font-bold text-white shadow-xl shadow-[#045fab]/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#045fab]/60 active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        {t('go')}
                      </span>
                      {/* Fancy hover effects */}
                      <span className="absolute inset-0 z-0 bg-[#0470c3] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                      {/* Glow effect */}
                      <span className="absolute -inset-1 z-0 scale-[1.15] rounded-xl bg-[#045fab] opacity-0 blur-xl transition-all duration-500 group-hover:opacity-60"></span>
                      {/* Animated accent */}
                      <span className="absolute -top-1 -right-1 h-16 w-16 rotate-45 bg-white/20 transition-all duration-700 group-hover:scale-150 group-hover:opacity-100"></span>
                    </Link>
                  ) : (
                    <Link
                      href={(checkoutUrl ?? '/auth/auth-v4') as any}
                      className="group relative z-10 inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#9c27b0] px-6 py-5 text-lg font-bold text-white shadow-xl shadow-[#9c27b0]/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9c27b0]/60 active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {t('plan.premium.goto')}
                      </span>
                      {/* Fancy hover effects */}
                      <span className="absolute inset-0 z-0 bg-[#7b1fa2] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                      {/* Glow effect */}
                      <span className="absolute -inset-1 z-0 scale-[1.15] rounded-xl bg-[#9c27b0] opacity-0 blur-xl transition-all duration-500 group-hover:opacity-70"></span>
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

        {/* Enhanced FAQ/Contact section */}
        <div className="mt-32 text-center">
          {/* Gradient divider instead of standard hr */}
          <div className="relative mx-auto mb-12 max-w-md">
            <div className="absolute inset-0 flex items-center">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="rounded-full bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-300 ring-1 ring-indigo-500/20 backdrop-blur-sm">
                {t('help')}
              </span>
            </div>
          </div>

          <p className="mb-6 text-lg opacity-80 md:text-xl dark:text-white">
            {t('questions')}
          </p>

          <a
            href="mailto:annatar.he+clippingkk@gmail.com"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#045fab]/10 px-6 py-3 text-[#045fab] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[#045fab]/15 hover:text-[#045fab] hover:shadow-lg hover:shadow-[#045fab]/20"
            referrerPolicy="no-referrer"
          >
            <span className="relative z-10 font-medium">
              annatar.he+clippingkk@gmail.com
            </span>
            <span className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default PricingContent
