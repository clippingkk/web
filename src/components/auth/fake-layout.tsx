'use client'
import React, { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import BindPhone from '@/components/bind-phone'
import LoadingIcon from '@/components/icons/loading.svg'
import { Button } from '@mantine/core'

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
    <>
      <div className='px-8 py-4 flex flex-col lg:flex-row rounded-sm bg-slate-200 dark:bg-slate-900 bg-opacity-70 dark:bg-opacity-90 backdrop-blur-sm shadow-lg'>
        <div
          className={'duration-150 container ' + (willBind ? 'opacity-50 ' : '')}
        >
          <h3 className=' text-2xl lg:text-5xl dark:text-gray-100'>
            {t('app.authCallback.logged')}
          </h3>
          <h4 className=' text-xl lg:text-3xl mt-4 dark:text-gray-100'>
            {t('app.authCallback.prevAccountTip')}
          </h4>
          <div className='my-8 flex flex-col lg:flex-row items-center justify-end gap-4'>
            <Button
              className='h-20 from-teal-400 via-teal-500 to-teal-400 bg-linear-to-br rounded-lg text-2xl lg:text-5xl duration-150'
              variant='outline'
              color='red'
              onClick={props.doBind}
            >
              {t('app.authCallback.createAccountDirectly')}
            </Button>
            {!willBind && (
              <Button
                className='h-20 from-blue-400 via-teal-400 to-orange-400 bg-linear-to-br rounded-lg text-2xl lg:text-4xl hover:shadow-lg hover:scale-105 duration-150'
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
          <div className='with-fade-in w-full mx-auto'>
            <span>No phone number bind yet</span>
            <BindPhone
              onFinalCheck={props.onAuthCallback}
            />
          </div>
        )}
        {props.loading && (
          <div className='flex w-full h-full absolute inset-0 bg-black bg-opacity-50 justify-center items-center flex-col backdrop-blur-xs with-fade-in'>
            <LoadingIcon className='animate-spin' />
            <span className='dark:text-white text-sm mt-4'>Submitting...</span>
          </div>
        )}
      </div>
    </>
  )
}

export default AuthCallbackPageContainer
