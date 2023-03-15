import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Head from 'next/head'
import { usePageTrack, useActionTrack } from '../../../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { UploadStep } from '../../../../services/uploader'
import LoadingModal from './loading-modal'
import { TGlobalStore } from '../../../../store'
import Switch from "react-switch"
import ClippingsUploadHelp from './help'
import { useUploadData } from '../../../../hooks/my-file'

import styles from './uploader.module.css'
import { useRouter } from 'next/router'
import AnimateOnChange from '../../../../components/SimpleAnimation/AnimateOnChange'
import DashboardContainer from '../../../../components/dashboard-container/container'
import { UserContent } from '../../../../store/user/type'

function useSwitcher() {
  const [isOn, setIsOn] = useState(true)
  const onSwitchChange = useCallback((checked: boolean) => {
    setIsOn(checked)
  }, [])

  return {
    isOn,
    onSwitchChange
  }
}

function UploaderPage() {
  usePageTrack('uploader')

  const { isOn, onSwitchChange } = useSwitcher()
  const { onUpload, step, count, at, messages } = useUploadData(isOn, true)
  const onUploadTrack = useActionTrack('upload')
  const { t } = useTranslation()

  const onDropEnd = useCallback((e: React.DragEvent) => {
    onUploadTrack()
    onUpload(e, isOn)
  }, [onUpload, onUploadTrack, isOn])

  const stopDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const { push: navigate } = useRouter()

  const profile = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const domain = profile.domain.length > 2 ? profile.domain : profile.id

  useEffect(() => {
    if (step === UploadStep.Done) {
      setTimeout(() => {
        navigate(`/dash/${domain}/home`)
      }, 3000)
    }
  }, [step, domain, navigate])

  return (
    <section className={styles.uploader}>
      <Head>
        <title>同步用户书摘</title>
      </Head>
      <div
        className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm bg-blue-800 bg-opacity-25 ${styles.box}`}
        onDragOver={stopDragOver}
        onDrop={onDropEnd}
      >
        {/* <FontAwesomeIcon icon="cloud-upload-alt" color="#ffffff" size="8x" /> */}
        <span className='text-6xl'>🎈</span>
        <h3 className='text-2xl lg:text-3xl dark:text-gray-300 text-center'>{t('app.upload.tip')}</h3>
      </div>

      <div className='mt-4 w-10/12 mx-auto'>
        <label className='w-full flex items-center justify-around'>
          <span className='lg:text-xl dark:text-gray-300'>
            <AnimateOnChange>
              <>
                {t(`app.upload.private.${isOn ? 'on' : 'off'}`) ?? ''}
              </>
            </AnimateOnChange>
          </span>
          <Switch onChange={onSwitchChange} checked={isOn} />
        </label>
      </div>
      <ClippingsUploadHelp />
      {step !== UploadStep.None && (
        <LoadingModal
          stepAt={step as UploadStep}
          count={count}
          at={at}
          message={messages[0]}
        />
      )}
    </section>
  )
}

UploaderPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default UploaderPage
