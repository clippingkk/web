'use client'
import type React from 'react'
import { useState } from 'react'

import BindPhone from '@/components/bind-phone'
import LoadingIcon from '@/components/icons/loading.svg'
import { useTranslation } from '@/i18n/client'

import Button from '../button/button'

type AuthCallbackPageContainerProps = {
  doBind: () => Promise<any>

  onAuthCallback: (pn: string, code: string) => Promise<any>
  loading: boolean
  children?: React.ReactElement
}

function AuthCallbackPageContainer(props: AuthCallbackPageContainerProps) {
  const [willBind, setWillBind] = useState(false)
  const { t } = useTranslation()
  return (
    <div className="relative w-full">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div
          className={`transition-all duration-500 ${willBind ? 'lg:translate-x-0' : 'lg:col-span-2 lg:mx-auto lg:max-w-2xl'}`}
        >
          <div className="rounded-3xl border border-gray-200/50 bg-white/95 p-8 shadow-2xl backdrop-blur-xl lg:p-10 dark:border-zinc-700/50 dark:bg-zinc-900/95">
            <div className="space-y-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-zinc-500">
                    Authentication Successful
                  </span>
                </div>
                <h3 className="mb-3 text-4xl font-bold lg:text-5xl">
                  <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                    {t('app.authCallback.logged')}
                  </span>
                </h3>
                <p className="text-lg text-gray-600 dark:text-zinc-400">
                  {t('app.authCallback.prevAccountTip')}
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  className="group relative h-14 w-full overflow-hidden bg-gradient-to-r from-blue-400 to-indigo-400 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl"
                  variant="primary"
                  size="xl"
                  onClick={props.doBind}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>{t('app.authCallback.createAccountDirectly')}</span>
                    <svg
                      className="h-5 w-5 transform transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 -translate-x-full -skew-x-12 transform bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                </Button>

                {!willBind && (
                  <Button
                    className="group h-14 w-full border-2 border-gray-300 bg-white transition-all duration-300 hover:border-blue-400 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-blue-400"
                    variant="outline"
                    size="xl"
                    onClick={() => setWillBind(true)}
                  >
                    <span className="flex items-center justify-center gap-2 font-medium text-gray-700 transition-colors group-hover:text-blue-400 dark:text-zinc-300">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>{t('app.authCallback.toBind')}</span>
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {willBind && (
          <div className="with-fade-in lg:col-span-1">
            <div className="rounded-3xl border border-gray-200/50 bg-white/95 p-8 shadow-2xl backdrop-blur-xl lg:p-10 dark:border-zinc-700/50 dark:bg-zinc-900/95">
              <div className="space-y-6">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                        Link Existing Account
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-zinc-500">
                        Connect with your phone number
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <BindPhone onFinalCheck={props.onAuthCallback} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {props.loading && (
        <div className="with-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="min-w-[200px] rounded-2xl border border-gray-200/50 bg-white p-8 shadow-2xl dark:border-zinc-700/50 dark:bg-zinc-900">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
                <LoadingIcon className="relative h-12 w-12 animate-spin text-blue-400" />
              </div>
              <div className="space-y-1 text-center">
                <p className="font-medium text-gray-900 dark:text-zinc-100">
                  Processing Request
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  This won't take long...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthCallbackPageContainer
