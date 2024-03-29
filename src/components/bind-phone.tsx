
import React, { useCallback, useEffect, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import * as sentry from '@sentry/react'
import AV from 'leancloud-storage'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { LeanCloudInit } from '../utils/leancloud'

type BindPhoneProps = {
  onFinalCheck(phone: string, code: string): Promise<any>
}

function BindPhone(props: BindPhoneProps) {
  const [pn, setPn] = useState('')
  const [capture, setCapture] = useState<AV.Captcha | null>(null)
  // const [capture, setCapture] = useState<AV.Captcha | null>({ url: 'https://picsum.photos/100/40' })
  const [smsSent, setSmsSent] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [code, setCode] = useState('')
  const { t } = useTranslation()
  useEffect(() => {
    LeanCloudInit()
  },[])

  const onPhoneNumberFinish = useCallback(() => {
    // 还没输入，直接干掉好了
    if (pn.length < 3) {
      return
    }
    if (pn.length < 5 || pn.length > 16) {
      toast.error(t('app.auth.errors.pnLen'))
      return
    }
    AV.Captcha.request().then(res => {
      setVerifyCode('')
      setCapture(res)
    }).catch(err => {
      sentry.withScope(s => {
        s.setExtra('pn', pn)
        sentry.captureException(err)
      })
      toast.error(err.toString())
    })
  }, [pn, t])
  const onVerifyCodeInputEnd = useCallback(() => {
    if (pn.length < 5 || pn.length > 16) {
      toast.error(t('app.auth.errors.pnLen'))
      return
    }
    if (verifyCode.length !== 4) {
      toast.error(t('app.auth.errors.verifyCodeLen'))
      return
    }
    capture?.verify(verifyCode).then(vt => {
      // send verify code
      AV.Cloud.requestSmsCode({
        mobilePhoneNumber: pn,
      }, {
        validateToken: vt
      }).then(res => {
        toast.success(t('app.auth.info.smsSent'))
        setSmsSent(true)
      }).catch(err => {
        sentry.withScope(s => {
          s.setExtras({ pn: pn })
          sentry.captureException(err)
        })
        toast.error(err.toString())
      })
    }).catch(err => {
      sentry.withScope(s => {
        s.setExtras({ pn: pn })
        sentry.captureException(err)
      })
      toast.error(err.toString())
      setVerifyCode('')
      onPhoneNumberFinish()
    })
  }, [pn, verifyCode, capture, t, onPhoneNumberFinish])
  const onCodeEnd = useCallback((e: any) => {
    if (!smsSent) {
      return
    }

    const code: string = e.target.value
    if (code.length != 6) {
      toast.error(t('app.auth.errors.codeLen'))
      return
    }

    props
      .onFinalCheck(pn, code)
      .catch(err => {
        console.error(err)
        toast.error(err.toString())
      })
  }, [pn, props, smsSent, t])

  useEffect(() => {
    // 中国区号，手机号长度达到 11 位都进行尝试发短信
    if (!pn.startsWith('+86') && !pn.startsWith('86')) {
      return
    }
    const realPN = pn.replace('+86', '')
    if (realPN.length !== 11) {
      return
    }
    onPhoneNumberFinish()
  }, [onPhoneNumberFinish, pn])
  useEffect(() => {
    if (verifyCode.length !== 4) {
      return
    }

    onVerifyCodeInputEnd()
  }, [verifyCode.length, onVerifyCodeInputEnd])

  return (
    <div className='w-full flex items-center justify-center rounded flex-col'>
      <div>
        <PhoneInput
          country='cn'
          inputClass='w-full p-4 text-lg'
          containerClass='w-full'
          preferredCountries={['cn']}
          value={pn}
          // 不知道手机号长度是多少，不能直接校验
          onChange={v => { setPn(v) }}
          onEnterKeyPress={onPhoneNumberFinish}
          onBlur={onPhoneNumberFinish}
          autoFormat={false}
        />
      </div>
      <div className='flex w-96 flex-col'>
        {capture && (
          <div className='flex mt-4 w-full'>
            <img src={capture?.url} onClick={onPhoneNumberFinish} />
            <input
              type='text'
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.trim())}
              maxLength={4}
              placeholder='verify code'
              className='w-full py-2 px-4 focus:outline-none bg-white dark:bg-gray-700 bg-opacity-90 '
              onKeyUp={e => {
                if (e.key.toLowerCase() !== 'enter') {
                  return
                }
                onVerifyCodeInputEnd()
              }}
            />
          </div>
        )}
        {smsSent && (
          <input
            type='text'
            value={code}
            onChange={e => {
              const val = e.target.value.trim()
              setCode(val)
              if (val.length === 6) {
                onCodeEnd(e)
              }
            }}
            placeholder={t('app.auth.code.placeholder') ?? ''}
            maxLength={6}
            onBlur={onCodeEnd}
            className='w-96 bg-white dark:bg-gray-700 bg-opacity-90 mx-auto mt-4 py-2 px-4 focus:outline-none'
            onKeyUp={e => {
              if (e.key.toLowerCase() !== 'enter') {
                return
              }
              onCodeEnd(e)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default BindPhone
