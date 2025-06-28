import React from 'react'

type ElegantDividerProps = {
  color?: 'blue' | 'purple' | 'green' | 'pink' | 'gray'
  intensity?: 'light' | 'medium' | 'strong'
  animated?: boolean
  className?: string
}

function ElegantDivider({ 
  color = 'blue', 
  intensity = 'medium', 
  animated = true,
  className = '' 
}: ElegantDividerProps) {
  const colorClasses = {
    blue: {
      light: 'via-blue-300/20 dark:via-blue-600/20',
      medium: 'via-blue-400/30 dark:via-blue-500/30',
      strong: 'via-blue-500/40 dark:via-blue-400/40'
    },
    purple: {
      light: 'via-purple-300/20 dark:via-purple-600/20',
      medium: 'via-purple-400/30 dark:via-purple-500/30',
      strong: 'via-purple-500/40 dark:via-purple-400/40'
    },
    green: {
      light: 'via-green-300/20 dark:via-green-600/20',
      medium: 'via-green-400/30 dark:via-green-500/30',
      strong: 'via-green-500/40 dark:via-green-400/40'
    },
    pink: {
      light: 'via-pink-300/20 dark:via-pink-600/20',
      medium: 'via-pink-400/30 dark:via-pink-500/30',
      strong: 'via-pink-500/40 dark:via-pink-400/40'
    },
    gray: {
      light: 'via-gray-300/20 dark:via-zinc-600/20',
      medium: 'via-gray-400/30 dark:via-zinc-500/30',
      strong: 'via-gray-500/40 dark:via-zinc-400/40'
    }
  }

  const colorClass = colorClasses[color][intensity]

  return (
    <div className={`relative h-px my-8 overflow-hidden ${className}`}>
      {/* Base gradient line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent" />
      
      {/* Enhanced color overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${colorClass} to-transparent ${animated ? 'animate-pulse' : ''}`} 
        style={animated ? { animationDuration: '3s' } : {}} />
    </div>
  )
}

export default ElegantDivider