import React from 'react'
import { UploadStep } from '../../../../services/uploader'

import { useTranslation } from 'react-i18next'
import AnimateOnChange from '../../../../components/SimpleAnimation/AnimateOnChange'

type LoadingModalProps = {
  stepAt: UploadStep
  count: number
  at: number
  message?: string
}

function LoadingModal(props: LoadingModalProps) {
  const { t } = useTranslation()
  // const [percent, setPercent] = useState(0)

  // useEffect(() => {
  //   const p = Math.ceil(props.at / props.count)
  //   if (p * 100 % 25 === 0) {
  //     setPercent(p)
  //   }
  // }, [props.count, props.at])

  return (
    <div
      className='fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-black bg-opacity-75 backdrop-blur-lg anna-fade-in'
    >
      <div
        className='px-32 py-16 rounded-sm shadow-lg bg-gray-100 flex justify-center items-center flex-col'
      >
        {/* <UploadLoading
        percent={percent}
        title={`Progress: ${(props.at / props.count * 100).toFixed(2)}`}
        progress={(props.at / props.count * 100)}
        message={props.message}
      /> */}
        <h2 className='text-3xl mb-8'>{t('app.upload.tips.extracting')}</h2>
        <AnimateOnChange>
          <span className='block text-6xl'>
            {props.stepAt !== UploadStep.Done && props.stepAt !== UploadStep.Error && (
              <span className='animate-bounce'>
                🎠
              </span>
            )}
            {props.stepAt === UploadStep.Done && '👌'}
            {props.stepAt === UploadStep.Error && '💥'}
          </span>
        </AnimateOnChange>
        <h3 className='text-3xl text-center'>
          {t(`app.upload.progress.${props.stepAt}`)}
          <span className='block text-sm text-gray-500 mt-2'>
            {Object.values(UploadStep).map(x => t(`app.upload.progress.${x}`)).join(' ▶ ')}
          </span>
        </h3>
        <AnimateOnChange>

          <h3 className='text-2xl font-bold'>
            {`Progress: ${(props.at / props.count * 100).toFixed(2)}%`}
            <span className='text-xl my-2 ml-4 text-gray-500'>
              {props.at} / {props.count}
            </span>
          </h3>
        </AnimateOnChange>
        <p className='text-xl text-red-500 mt-2'>
          {props.message}
        </p>
      </div>
    </div>
  )
}

export default LoadingModal
