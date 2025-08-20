import { Mail } from 'lucide-react'
import PageTrack from '@/components/track/page-track'
import { useTranslation } from '@/i18n'

async function PolicySupportPage() {
  const { t } = await useTranslation()

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
        {/* Background with gradient orbs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900"></div>

          {/* Gradient orbs using the primary color #045fab */}
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-[#045fab]/30 to-purple-600/20 blur-3xl"></div>
          <div className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-[#045fab]/20 to-blue-400/10 blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 h-60 w-60 rounded-full bg-gradient-to-tr from-[#045fab]/10 to-cyan-400/10 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-20">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white/5 p-8 backdrop-blur-lg">
            {/* ClippingKK logo/title */}
            <h1 className="font-lato mb-10 bg-gradient-to-r from-blue-300 to-[#045fab] bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent">
              ClippingKK
            </h1>

            {/* Support title */}
            <h2 className="mb-6 text-center text-3xl font-bold text-white">
              {t('support.title') || 'Support Information'}
            </h2>

            {/* Divider with gradient */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-400/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-opacity-50 bg-slate-900 px-4 text-sm text-gray-400 backdrop-blur-sm">
                  {t('support.contact') || 'Contact Us'}
                </span>
              </div>
            </div>

            {/* Support message */}
            <p className="mb-8 text-center text-lg text-gray-300">
              {t('support.message') ||
                'If you need any help, feel free to send your question to the email below.'}
            </p>

            {/* Email with fancy styling */}
            <div className="mx-auto mb-4 max-w-md rounded-xl bg-gradient-to-r from-[#045fab]/20 to-blue-600/10 p-6 backdrop-blur-sm">
              <a
                href="mailto:annatar.he+ck.support@gmail.com"
                className="group flex items-center justify-center gap-3 text-center text-xl font-medium text-blue-300 transition-all duration-300 hover:text-white"
              >
                <Mail className="h-6 w-6 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="group-hover:underline">
                  annatar.he+ck.support@gmail.com
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <PageTrack page="support" />
    </>
  )
}

export default PolicySupportPage
