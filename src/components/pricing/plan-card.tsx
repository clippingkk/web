import { Divider } from '@mantine/core'
import React from 'react'
import styles from './plan-card.module.css'
import { Star, Gem } from 'lucide-react'

type PlanCardProps = {
  title: React.ReactNode | string
  description: string
  features: React.ReactNode
  plan: 'free' | 'premium'
}

function PlanCard(props: PlanCardProps) {
  const { title, description, features, plan } = props
  return (
    <div className="relative h-full">
      {plan === 'premium' && (
        <div className="absolute -top-5 right-8 py-1 px-4 bg-gradient-to-r from-amber-400 to-pink-500 text-white rounded-full shadow-lg z-10 font-bold transform rotate-2 animate-pulse">
          Recommended
        </div>
      )}
      <div className='w-full flex justify-center h-full dark:text-gray-100'>
        <div
          className={`${styles[`card-bg-${plan}`]} relative p-8 md:p-12 shadow-2xl w-full max-w-md rounded-2xl backdrop-blur-xl hover:shadow-3xl duration-300 transition-all hover:translate-y-[-8px] border border-white/10 h-full flex flex-col`}
        >
          <div className="flex items-center mb-4">
            {plan === 'free' ? (
              <Star className="w-8 h-8 mr-3 text-amber-400" />
            ) : (
              <Gem className="w-8 h-8 mr-3 text-indigo-400" />
            )}
            {typeof title === 'string' ? (
              <h2 className='text-4xl md:text-5xl font-bold'>{title}</h2>
            ) : title}
          </div>
          <h6 className='text-lg opacity-80 mb-6'>{description}</h6>
          <Divider className='my-6' variant="dotted" />
          <div className="flex-grow">
            {features}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanCard
