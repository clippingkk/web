import { Mail } from 'lucide-react'

import PageTrack from '@/components/track/page-track'
import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import Surface from '@/components/ui/surface/surface'
import { getTranslation } from '@/i18n'

async function PolicySupportPage() {
  const { t } = await getTranslation()

  return (
    <>
      <div className="anna-page-container relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
        <DecorBlobs />
        <Surface
          variant="elevated"
          className="with-slide-in relative z-10 w-full max-w-xl p-8 md:p-12"
        >
          <h1 className="font-lato mb-10 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-center text-4xl font-semibold tracking-tight text-transparent md:text-5xl">
            ClippingKK
          </h1>

          <h2 className="mb-6 text-center text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">
            {t('support.title') || 'Support Information'}
          </h2>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/70 dark:border-slate-800/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/70 px-3 text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/70 dark:text-slate-400">
                {t('support.contact') || 'Contact Us'}
              </span>
            </div>
          </div>

          <p className="mb-8 text-center text-base text-slate-600 dark:text-slate-300">
            {t('support.message') ||
              'If you need any help, feel free to send your question to the email below.'}
          </p>

          <div className="mx-auto mb-2 max-w-md rounded-xl border border-blue-400/20 bg-blue-400/10 p-5 dark:bg-blue-400/15">
            <a
              href="mailto:annatar.he+ck.support@gmail.com"
              className="group flex items-center justify-center gap-3 text-center text-lg font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
            >
              <Mail className="h-5 w-5 text-blue-500 transition-transform duration-200 group-hover:scale-110 dark:text-blue-400" />
              <span className="group-hover:underline">
                annatar.he+ck.support@gmail.com
              </span>
            </a>
          </div>
        </Surface>
      </div>
      <PageTrack page="support" />
    </>
  )
}

export default PolicySupportPage
