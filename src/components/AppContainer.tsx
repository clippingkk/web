'use client'
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useUploadData } from '../hooks/my-file'
import { useActionTrack } from '../hooks/tracke'
import { TGlobalStore } from '../store'
import FloatingProgress from './progress/floating'

type AppContainerProps = {
  children: React.ReactElement
}

function AppContainer(props: AppContainerProps) {
  const id = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const { onUpload,step, at, count } = useUploadData(true, id > 0)
  const onUploadTrack = useActionTrack('upload')
  const { t } = useTranslation()

  const [isDraging, setIsDraging] = useState(false)
  const [isUploadPage, setIsUploadPage] = useState(false)

  // 由于找不到 on history change 的事件，这里靠 interval 来 work around
  useEffect(() => {
    const timer = setInterval(() => {
      setIsUploadPage(/dash\/\d+\/upload/.test(location.pathname))
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const onDropEnd = useCallback((e: React.DragEvent) => {
    setIsDraging(false)
    // upload 页面不需要
    if (isUploadPage) {
      return
    }
    onUploadTrack()
    onUpload(e, true)
  }, [onUpload, onUploadTrack, isUploadPage])

  const stopDragOver = useCallback((e: React.DragEvent) => {
    if (isUploadPage) {
      return
    }
    if (!isDraging) {
      setIsDraging(true)
    }
    e.preventDefault()
  }, [isDraging, isUploadPage])

  return (
    <div
      className='w-full h-full'
      onDragOver={stopDragOver}
      onDrop={onDropEnd}
    >
      <>
        {props.children}
        {isDraging && (
          <div
            className='z-50 top-0 left-0 right-0 bottom-0 fixed bg-slate-900 bg-opacity-50 with-fade-in backdrop-blur-xl flex justify-center items-center'
            onClick={() => {
              setIsDraging(false)
            }}
          >
            <div className='p-40 bg-gradient-to-br rounded text-slate-900 font-bold from-orange-500 to-teal-500 flex justify-center items-center flex-col'>
              <ArrowDownTrayIcon className='w-16 h-16 text-black dark:text-white' />
              <p className='text-6xl font-lxgw font-bold mt-8'>
                {t('app.upload.dropHere')}
              </p>
            </div>
          </div>
        )}
        <FloatingProgress step={step} at={at} count={count} />
      </>
    </div>
  )
}

export default AppContainer
