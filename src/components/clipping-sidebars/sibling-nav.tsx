import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'

import { getTranslation } from '@/i18n'
import type { Clipping } from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'

function getSiblingLink(
  iac: IN_APP_CHANNEL,
  domain?: string,
  clipping?: Pick<Clipping, 'prevClipping' | 'nextClipping'>
) {
  let prev = '',
    next = ''
  if (!clipping) {
    return { prev, next }
  }
  switch (iac) {
    case IN_APP_CHANNEL.clippingFromBook:
      prev = clipping.prevClipping.bookClippingID
        ? `/dash/${domain}/clippings/${clipping?.prevClipping.bookClippingID}?iac=${iac}`
        : ''
      next = clipping.nextClipping.bookClippingID
        ? `/dash/${domain}/clippings/${clipping?.nextClipping.bookClippingID}?iac=${iac}`
        : ''
    default:
      prev = clipping.prevClipping.userClippingID
        ? `/dash/${domain}/clippings/${clipping?.prevClipping.userClippingID}?iac=${iac}`
        : ''
      next = clipping.nextClipping.userClippingID
        ? `/dash/${domain}/clippings/${clipping?.nextClipping.userClippingID}?iac=${iac}`
        : ''
  }
  return {
    prev,
    next,
  }
}

type Props = {
  clipping?: Pick<
    Clipping,
    | 'id'
    | 'visible'
    | 'content'
    | 'title'
    | 'createdAt'
    | 'nextClipping'
    | 'prevClipping'
  >
  iac: IN_APP_CHANNEL
  domain?: string
}

async function SiblingNav(props: Props) {
  const { t } = await getTranslation()
  const { clipping, iac, domain } = props
  const { prev, next } = getSiblingLink(iac, domain, clipping)

  return (
    <div className="space-y-3">
      {/* Navigation Cards */}
      {(prev || next) && (
        <div className="grid grid-cols-1 gap-2">
          {prev && (
            <Link href={prev as any} className="group block">
              <div className="relative rounded-xl border border-gray-200/40 bg-white/40 p-3 backdrop-blur-sm transition-all duration-200 hover:border-gray-300/50 hover:bg-white/60 hover:shadow-sm dark:border-zinc-700/40 dark:bg-zinc-800/40 dark:hover:border-zinc-600/50 dark:hover:bg-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 p-2 shadow-sm transition-all duration-200 group-hover:shadow-md dark:from-emerald-400 dark:to-emerald-500">
                    <ArrowUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-zinc-500">
                      Previous
                    </div>
                    <div className="text-sm font-medium text-gray-900 transition-colors group-hover:text-emerald-600 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                      {t('app.clipping.sidebar.prev')}
                    </div>
                  </div>
                  <div className="text-gray-400 transition-colors group-hover:text-emerald-500 dark:text-zinc-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {next && (
            <Link href={next as any} className="group block">
              <div className="relative rounded-xl border border-gray-200/40 bg-white/40 p-3 backdrop-blur-sm transition-all duration-200 hover:border-gray-300/50 hover:bg-white/60 hover:shadow-sm dark:border-zinc-700/40 dark:bg-zinc-800/40 dark:hover:border-zinc-600/50 dark:hover:bg-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 p-2 shadow-sm transition-all duration-200 group-hover:shadow-md dark:from-teal-400 dark:to-teal-500">
                    <ArrowDown className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-zinc-500">
                      Next
                    </div>
                    <div className="text-sm font-medium text-gray-900 transition-colors group-hover:text-teal-600 dark:text-zinc-50 dark:group-hover:text-teal-400">
                      {t('app.clipping.sidebar.next')}
                    </div>
                  </div>
                  <div className="text-gray-400 transition-colors group-hover:text-teal-500 dark:text-zinc-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* No navigation state */}
      {!prev && !next && (
        <div className="relative rounded-xl border border-gray-200/20 bg-white/20 p-4 backdrop-blur-sm dark:border-zinc-700/20 dark:bg-zinc-800/20">
          <div className="text-center">
            <div className="mb-2 inline-flex rounded-lg bg-gray-100 p-3 dark:bg-zinc-700">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-zinc-400">
              End of Collection
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
              {t('app.clipping.sidebar.noNavigation', 'No more clippings')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SiblingNav
