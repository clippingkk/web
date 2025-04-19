import { useTranslation } from '@/i18n'

async function Layout(props: { children: React.ReactNode }) {
  const { t } = await useTranslation()
  return (
    <section className="container px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Decorative background */}
        <div className="absolute -z-10 inset-x-0 top-0 h-40 bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-3xl rounded-b-3xl" />

        {/* Header with gradient text */}
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-center">
            <span className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent pb-1">
              🪩 {t('app.menu.square')}
            </span>
          </h2>
          <div className="w-full max-w-2xl mx-auto mt-6 border-b border-gray-200 dark:border-gray-700 opacity-70" />
        </div>
      </div>

      {/* Main content area */}
      <div className="mt-6 md:mt-10">
        {props.children}
      </div>
    </section>
  )
}

export default Layout
