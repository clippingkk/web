import { ExternalLink, FileText, HelpCircle, Youtube } from 'lucide-react'
import { useTranslation } from '@/i18n'

async function ClippingsUploadHelp() {
  const { t } = await useTranslation(undefined, 'upload')

  return (
    <div className='w-full rounded-xl bg-white/70 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/70'>
      <div className='mb-4 flex items-center'>
        <HelpCircle size={20} className='mr-2 text-blue-500' />
        <h3 className='text-lg font-semibold dark:text-slate-300'>
          {t('app.upload.help.title')}
        </h3>
      </div>

      <div className='space-y-4'>
        <div className='border-l-4 border-blue-500 py-1 pl-3 dark:border-blue-400'>
          <h4 className='mb-1 flex items-center text-sm font-medium dark:text-slate-300'>
            <FileText size={16} className='mr-1' />
            {t('app.upload.help.how_to_title') ??
              'How to export your Kindle clippings'}
          </h4>
          <p className='text-sm text-gray-600 dark:text-slate-400'>
            {t('app.upload.help.how_to_description') ??
              'Connect your Kindle to computer via USB, and find the "My Clippings.txt" file in Documents folder.'}
          </p>
        </div>

        <div className='flex flex-col items-start gap-4 md:flex-row'>
          <a
            className='flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-800/30'
            href='https://www.bilibili.com/video/BV11z4y1y7fx'
            target='_blank'
            rel='noreferrer'
          >
            <Youtube size={18} className='mr-2' />
            <span>
              {t('app.upload.help.watch_video') ?? 'Watch Tutorial Video'}
            </span>
            <ExternalLink size={14} className='ml-1 opacity-70' />
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
