'use client'
import type React from 'react'
import { useState } from 'react'
import BindPhone from '@/components/bind-phone'
import LoadingIcon from '@/components/icons/loading.svg'
import { useTranslation } from '@/i18n/client'
import Button from '../button/button'

type AuthCallbackPageContainerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doBind: () => Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthCallback: (pn: string, code: string) => Promise<any>
  loading: boolean
  children?: React.ReactElement
}

function AuthCallbackPageContainer(props: AuthCallbackPageContainerProps) {
  const [willBind, setWillBind] = useState(false)
  const { t } = useTranslation()
  return (
    <div className='relative w-full'>
      <div className='grid lg:grid-cols-2 gap-8 lg:gap-12'>
        <div
          className={`transition-all duration-500 ${willBind ? 'lg:translate-x-0' : 'lg:col-span-2 lg:max-w-2xl lg:mx-auto'}`}
        >
          <div className='bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-gray-200/50 dark:border-zinc-700/50'>
            <div className='space-y-6'>
              <div>
                <div className='inline-flex items-center gap-2 mb-4'>
                  <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                  <span className='text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider'>
                    Authentication Successful
                  </span>
                </div>
                <h3 className='text-4xl lg:text-5xl font-bold mb-3'>
                  <span className='bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent'>
                    {t('app.authCallback.logged')}
                  </span>
                </h3>
                <p className='text-gray-600 dark:text-zinc-400 text-lg'>
                  {t('app.authCallback.prevAccountTip')}
                </p>
              </div>

              <div className='space-y-4 pt-4'>
                <Button
                  className='group w-full h-14 relative overflow-hidden bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
                  variant='primary'
                  size='xl'
                  onClick={props.doBind}
                >
                  <span className='relative z-10 flex items-center justify-center gap-2'>
                    <span>{t('app.authCallback.createAccountDirectly')}</span>
                    <svg
                      className='w-5 h-5 transform group-hover:translate-x-1 transition-transform'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 7l5 5m0 0l-5 5m5-5H6'
                      />
                    </svg>
                  </span>
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
                </Button>

                {!willBind && (
                  <Button
                    className='group w-full h-14 bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300'
                    variant='outline'
                    size='xl'
                    onClick={() => setWillBind(true)}
                  >
                    <span className='text-gray-700 dark:text-zinc-300 group-hover:text-blue-400 transition-colors font-medium flex items-center justify-center gap-2'>
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 4v16m8-8H4'
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
          <div className='with-fade-in lg:col-span-1'>
            <div className='bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-gray-200/50 dark:border-zinc-700/50'>
              <div className='space-y-6'>
                <div>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className='text-lg font-semibold text-gray-900 dark:text-zinc-100'>
                        Link Existing Account
                      </h4>
                      <p className='text-sm text-gray-500 dark:text-zinc-500'>
                        Connect with your phone number
                      </p>
                    </div>
                  </div>
                </div>
                <div className='pt-2'>
                  <BindPhone onFinalCheck={props.onAuthCallback} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {props.loading && (
        <div className='with-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 min-w-[200px]'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='relative'>
                <div className='absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20' />
                <LoadingIcon className='relative w-12 h-12 text-blue-400 animate-spin' />
              </div>
              <div className='text-center space-y-1'>
                <p className='font-medium text-gray-900 dark:text-zinc-100'>
                  Processing Request
                </p>
                <p className='text-sm text-gray-500 dark:text-zinc-400'>
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
