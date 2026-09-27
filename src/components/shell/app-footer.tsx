import Link from 'next/link'

import { getTranslation } from '@/i18n'

const version = process.env.GIT_COMMIT?.slice(0, 7) ?? ''

const linkClass =
  'rounded-sm transition-colors duration-150 outline-none hover:text-lake-fg focus-visible:ring-2 focus-visible:ring-lake-ring'

async function AppFooter() {
  const { t } = await getTranslation(undefined, 'common')
  const year = new Date().getFullYear()

  return (
    <footer className="border-lake-line bg-lake-canvas border-t">
      <div className="text-lake-fg-subtle mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {year}{' '}
          <span className="font-reading text-lake-fg-muted">ClippingKK</span>
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          {t('shell.footer.tagline')}
        </p>
        <nav aria-label={t('shell.footer.label')}>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <li>
              <Link href="/pricing" className={linkClass}>
                {t('shell.footer.pricing')}
              </Link>
            </li>
            <li>
              <Link href="/policy/privacy" className={linkClass}>
                {t('shell.footer.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/policy/support" className={linkClass}>
                {t('shell.footer.support')}
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/clippingkk/web"
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                GitHub
              </a>
            </li>
            {version ? (
              <li
                className="font-mono text-xs"
                title={t('shell.footer.version')}
              >
                {version}
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export default AppFooter
