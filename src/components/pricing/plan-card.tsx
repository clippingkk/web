import { Gem, Sparkles, Star } from 'lucide-react'
import type React from 'react'

type PlanCardProps = {
  title: React.ReactNode | string
  description: string
  features: React.ReactNode
  plan: 'free' | 'premium'
}

function PlanCard(props: PlanCardProps) {
  const { title, description, features, plan } = props
  return (
    <div className='relative h-full'>
      {plan === 'premium' && (
        <div className='absolute -top-6 right-6 z-20 rotate-2 transform'>
          <div className='group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-pink-600 px-6 py-2 font-bold text-white shadow-lg shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-fuchsia-500/40'>
            <span className='relative z-10 flex items-center gap-1'>
              <Sparkles className='h-4 w-4' />
              <span>Recommended</span>
            </span>
            {/* Glow effect */}
            <span className='absolute -inset-1 z-0 scale-[1.15] rounded-full bg-gradient-to-r from-amber-400 to-pink-500 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-70'></span>
            {/* Animated shine effect */}
            <span className='absolute inset-0 z-0 translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transition-transform duration-1000 group-hover:translate-x-[-300%]'></span>
          </div>
        </div>
      )}
      <div className='flex h-full w-full justify-center dark:text-gray-100'>
        <div
          className={`group relative flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:translate-y-[-8px] md:p-10 ${
            plan === 'premium'
              ? 'border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-indigo-950/80 to-slate-900/90 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)]'
              : 'border-white/10 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)]'
          }`}
        >
          {/* Icon and title with enhanced styling */}
          <div className='mb-6 flex items-center'>
            {plan === 'free' ? (
              <div className='mr-4 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 p-3 shadow-inner ring-2 ring-amber-500/20'>
                <Star className='h-8 w-8 text-amber-400' />
              </div>
            ) : (
              <div className='mr-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-700/20 p-3 shadow-inner ring-2 ring-indigo-400/30'>
                <Gem className='h-8 w-8 text-indigo-400' />
              </div>
            )}
            {typeof title === 'string' ? (
              <h2 className='text-4xl font-bold tracking-tight md:text-5xl'>
                {title}
              </h2>
            ) : (
              title
            )}
          </div>

          {/* Description with better typography */}
          <p className='mb-8 text-lg leading-relaxed tracking-wide opacity-80'>
            {description}
          </p>

          {/* Subtle glow effect that appears on hover (premium only) */}
          {plan === 'premium' && (
            <div className='absolute -inset-[200px] bg-indigo-600/20 opacity-0 blur-[100px] transition-opacity duration-1000 group-hover:opacity-20'></div>
          )}
          {/* Elegant separator with enhanced styling */}
          <div className='relative my-4 py-4'>
            <div className='absolute inset-0 flex items-center'>
              <div
                className={`w-full ${plan === 'premium' ? 'bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-400/20 to-transparent'} h-px`}
              ></div>
            </div>
            <div className='relative flex justify-center'>
              <span
                className={`rounded-full px-4 py-1 text-sm font-medium ${plan === 'premium' ? 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-gray-500/10 text-gray-300 ring-1 ring-gray-500/20'}`}
              >
                {plan === 'premium' ? 'Premium Benefits' : 'Features'}
              </span>
            </div>
          </div>
          {/* Features section with subtle animation on hover */}
          <div className='flex-grow transition-all duration-300 group-hover:translate-y-0'>
            {features}
          </div>

          {/* Animated corner accent (premium only) */}
          {plan === 'premium' && (
            <div className='absolute -right-12 -bottom-12 h-24 w-24 transform rounded-full bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 opacity-50 blur-xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-70'></div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlanCard
