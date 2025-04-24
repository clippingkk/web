import { useTranslation } from '@/i18n'
import { ArrowLeft, BookX } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found - ClippingKK',
  description: 'The page you are looking for does not exist.',
}

async function NotFound() {
  const { t } = await useTranslation()
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8">
      <div className="relative max-w-xl w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl overflow-hidden backdrop-blur-xl border border-gray-100/20 dark:border-gray-800/30 p-8 md:p-12">
        {/* Decorative blur elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-6 rounded-full mb-6">
            <BookX size={64} className="text-indigo-500" strokeWidth={2} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('page_not_found')}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t('page_not_found_message')}
          </p>
          
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1"
          >
            <ArrowLeft size={20} />
            {t('return_home')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
