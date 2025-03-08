import React from 'react'
import { useTranslation } from '@/i18n/client'
import { ExternalLink, HelpCircle, FileText, Youtube } from 'lucide-react'

function ClippingsUploadHelp() {
  const { t } = useTranslation(undefined, 'upload')

  return (
    <div className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <div className="flex items-center mb-4">
        <HelpCircle size={20} className="text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold">
          {t('app.upload.help.title')}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="border-l-4 border-blue-500 pl-3 py-1">
          <h4 className="font-medium text-sm mb-1 flex items-center">
            <FileText size={16} className="mr-1" />
            {t('app.upload.help.how_to_title') ?? 'How to export your Kindle clippings'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('app.upload.help.how_to_description') ??
              'Connect your Kindle to computer via USB, and find the "My Clippings.txt" file in Documents folder.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-4">
          <a
            className="flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors border border-blue-200 dark:border-blue-800"
            href='https://www.bilibili.com/video/BV11z4y1y7fx'
            target='_blank' rel="noreferrer"
          >
            <Youtube size={18} className="mr-2" />
            <span>{t('app.upload.help.watch_video') ?? 'Watch Tutorial Video'}</span>
            <ExternalLink size={14} className="ml-1 opacity-70" />
          </a>

          {/* <a
            className="flex items-center px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors border border-purple-200 dark:border-purple-800"
            href={t('app.upload.help.doc_link') ?? 'https://help.clippingkk.com'}
            target='_blank' rel="noreferrer"
          >
            <Info size={18} className="mr-2" />
            <span>{t('app.upload.help.documentation') ?? 'View Documentation'}</span>
            <ExternalLink size={14} className="ml-1 opacity-70" />
          </a> */}
        </div>
      </div>
    </div>
  )
}

export default ClippingsUploadHelp
