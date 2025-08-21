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
    <div className='bg-opacity-70 dark:bg-opacity-90 flex flex-col rounded-sm bg-slate-200 px-8 py-4 shadow-lg backdrop-blur-sm lg:flex-row dark:bg-slate-900'>
      <div className={`container duration-150 ${willBind ? 'opacity-50' : ''}`}>
        <h3 className='text-2xl lg:text-5xl dark:text-gray-100'>
          {t('app.authCallback.logged')}
        </h3>
        <h4 className='mt-4 text-xl lg:text-3xl dark:text-gray-100'>
          {t('app.authCallback.prevAccountTip')}
        </h4>
        <div className='my-8 flex flex-col items-center justify-end gap-4 lg:flex-row'>
          <Button
            className='h-20 text-2xl lg:text-5xl'
            variant='outline'
            size='xl'
            onClick={props.doBind}
          >
            {t('app.authCallback.createAccountDirectly')}
          </Button>
          {!willBind && (
            <Button
              className='h-20 bg-gradient-to-br from-blue-500 via-teal-500 to-orange-500 text-2xl before:from-blue-500 before:to-orange-500 lg:text-4xl'
              variant='primary'
              size='xl'
              onClick={() => {
                setWillBind(true)
              }}
            >
              {t('app.authCallback.toBind')}
            </Button>
          )}
        </div>
      </div>
      {willBind && (
        <div className='with-fade-in mx-auto w-full'>
          <span>No phone number bind yet</span>
          <BindPhone onFinalCheck={props.onAuthCallback} />
        </div>
      )}
      {props.loading && (
        <div className='bg-opacity-50 with-fade-in absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-black backdrop-blur-xs'>
          <LoadingIcon className='animate-spin' />
          <span className='mt-4 text-sm dark:text-white'>Submitting...</span>
        </div>
      )}
    </div>
  )
}

export default AuthCallbackPageContainer
