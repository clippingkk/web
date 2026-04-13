import { Award, BookOpen, Library, TrendingUp } from 'lucide-react'

import { getTranslation } from '@/i18n'

type ProfileAnalyticsProps = {
  clippingsCount: number
  booksCount: number
  createdAt: string
}

async function ProfileAnalytics({
  clippingsCount,
  booksCount,
  createdAt,
}: ProfileAnalyticsProps) {
  const { t } = await getTranslation()

  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - created.getTime())
  const memberDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const avgClippingsPerDay =
    memberDays === 0 ? 0 : (clippingsCount / memberDays).toFixed(1)

  const stats = [
    {
      icon: BookOpen,
      label: t('app.profile.analytics.clippings'),
      value: clippingsCount.toLocaleString(),
      gradient: 'from-blue-400 to-blue-500',
      bgGradient:
        'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      icon: Library,
      label: t('app.profile.analytics.books'),
      value: booksCount.toLocaleString(),
      gradient: 'from-indigo-400 to-indigo-500',
      bgGradient:
        'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
    },
    {
      icon: TrendingUp,
      label: t('app.profile.analytics.dailyAvg'),
      value: avgClippingsPerDay,
      gradient: 'from-emerald-400 to-emerald-500',
      bgGradient:
        'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
    },
    {
      icon: Award,
      label: t('app.profile.analytics.memberDays'),
      value: memberDays.toLocaleString(),
      gradient: 'from-amber-400 to-amber-500',
      bgGradient:
        'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
    },
  ]

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        {t('app.profile.analytics.title')}
      </h3>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br p-4 ${stat.bgGradient} group border border-gray-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700/50`}
            >
              <div className="relative z-10">
                <div
                  className={`mb-3 inline-flex rounded-lg bg-gradient-to-br p-2 ${stat.gradient} shadow-sm transition-shadow group-hover:shadow-md`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>

              <div
                className={`absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 transition-transform duration-500 group-hover:scale-150`}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('app.profile.analytics.readingStreak')}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {clippingsCount > 0
              ? t('app.profile.analytics.active')
              : t('app.profile.analytics.getStarted')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileAnalytics
