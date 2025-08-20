import React from 'react'

type TDividerProps = {
  title: string
  variant?: 'default' | 'elegant' | 'minimal'
  color?: 'blue' | 'purple' | 'green' | 'gray'
}

function Divider({
  title,
  variant = 'elegant',
  color = 'blue',
}: TDividerProps) {
  const colorClasses = {
    blue: {
      accent: 'from-blue-400/30 via-blue-500/40 to-blue-400/30',
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/80 dark:bg-blue-900/20',
      border: 'border-blue-200/50 dark:border-blue-800/50',
      glow: 'shadow-blue-500/20',
    },
    purple: {
      accent: 'from-purple-400/30 via-purple-500/40 to-purple-400/30',
      text: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50/80 dark:bg-purple-900/20',
      border: 'border-purple-200/50 dark:border-purple-800/50',
      glow: 'shadow-purple-500/20',
    },
    green: {
      accent: 'from-green-400/30 via-green-500/40 to-green-400/30',
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50/80 dark:bg-green-900/20',
      border: 'border-green-200/50 dark:border-green-800/50',
      glow: 'shadow-green-500/20',
    },
    gray: {
      accent: 'from-gray-400/30 via-gray-500/40 to-gray-400/30',
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50/80 dark:bg-gray-900/20',
      border: 'border-gray-200/50 dark:border-gray-800/50',
      glow: 'shadow-gray-500/20',
    },
  }

  const colors = colorClasses[color]

  if (variant === 'minimal') {
    return (
      <div className="relative flex items-center w-full my-8">
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent"></div>
        <span className="flex-shrink mx-6 text-sm font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent"></div>
      </div>
    )
  }

  if (variant === 'elegant') {
    return (
      <div className="relative flex items-center w-full my-12">
        {/* Main gradient line */}
        <div className="flex-grow relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent"></div>
          <div
            className={`absolute inset-0 bg-gradient-to-r ${colors.accent} animate-pulse`}
            style={{ animationDuration: '3s' }}
          ></div>
        </div>

        {/* Enhanced title container */}
        <div className="relative mx-6">
          {/* Subtle glow effect */}
          <div
            className={`absolute inset-0 blur-xl ${colors.bg} opacity-60`}
          ></div>

          {/* Main title container */}
          <div
            className={`relative px-6 py-3 ${colors.bg} backdrop-blur-sm rounded-2xl border ${colors.border} shadow-sm ${colors.glow}`}
          >
            {/* Decorative dots */}
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.accent.replace('/30', '/60').replace('/40', '/80')}`}
              ></div>
              <span
                className={`text-base font-semibold ${colors.text} tracking-wide`}
              >
                {title}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.accent.replace('/30', '/60').replace('/40', '/80')}`}
              ></div>
            </div>
          </div>
        </div>

        {/* Main gradient line */}
        <div className="flex-grow relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent"></div>
          <div
            className={`absolute inset-0 bg-gradient-to-r ${colors.accent} animate-pulse`}
            style={{ animationDuration: '3s', animationDelay: '1s' }}
          ></div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="relative flex items-center w-full my-8">
      <div className="flex-grow border-t border-gray-300 dark:border-zinc-700"></div>
      <span
        className={`flex-shrink mx-4 px-4 py-2 text-lg font-medium ${colors.text} ${colors.bg} rounded-xl shadow-sm border ${colors.border} backdrop-blur-sm`}
      >
        {title}
      </span>
      <div className="flex-grow border-t border-gray-300 dark:border-zinc-700"></div>
    </div>
  )
}

export default Divider
