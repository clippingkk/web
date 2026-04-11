import type React from 'react'

type SettingsSectionLayoutProps = {
  icon: React.ReactNode
  iconBgClass: string
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSectionLayout({
  icon,
  iconBgClass,
  title,
  description,
  children,
}: SettingsSectionLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col items-center text-center">
          <div className={`mb-4 rounded-full p-3 ${iconBgClass}`}>{icon}</div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="max-w-lg text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
        {children}
      </div>
    </div>
  )
}

export default SettingsSectionLayout
