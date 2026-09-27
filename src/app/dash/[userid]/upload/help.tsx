import { ExternalLink } from 'lucide-react'

import { getTranslation } from '@/i18n'

async function ImportHelp() {
  const { t } = await getTranslation(undefined, 'import')
  return (
    <details className="group rounded-lake-panel border-lake-line bg-lake-surface border p-5">
      <summary className="text-lake-fg cursor-pointer list-none text-sm font-medium marker:hidden">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="text-lake-fg-subtle transition-transform duration-150 group-open:rotate-90"
          >
            ›
          </span>
          {t('help.title')}
        </span>
      </summary>
      <div className="mt-3 flex flex-col gap-3 pl-5">
        <p className="text-lake-fg-muted text-sm leading-relaxed">
          {t('help.body')}
        </p>
        <a
          href="https://www.bilibili.com/video/BV11z4y1y7fx"
          target="_blank"
          rel="noreferrer"
          className="text-lake-accent-text focus-visible:ring-lake-ring inline-flex w-fit items-center gap-1 rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-2"
        >
          {t('help.video')}
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </details>
  )
}

export default ImportHelp
