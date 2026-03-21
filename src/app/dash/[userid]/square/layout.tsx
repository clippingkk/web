import { getTranslation } from '@/i18n'

async function Layout(props: { children: React.ReactNode }) {
  const { t } = await getTranslation()
  return (
    <section className="container px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Decorative background */}
        <div className="absolute inset-x-0 top-0 -z-10 h-40 rounded-b-3xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-3xl" />

        {/* Header with gradient text */}
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <h2 className="text-center text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            <span className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text pb-1 text-transparent">
              🪩 {t('app.menu.square')}
            </span>
          </h2>
          <div className="mx-auto mt-6 w-full max-w-2xl border-b border-gray-200 opacity-70 dark:border-gray-700" />
        </div>
      </div>

      {/* Main content area */}
      <div className="mt-6 md:mt-10">{props.children}</div>
    </section>
  )
}

export default Layout
