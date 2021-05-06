import React, { useCallback, useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import AV from 'leancloud-storage'
import Card from '../../components/card/card'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

type AuthPhoneProps = {
}

function AuthPhone(props: AuthPhoneProps) {

  const [pn, setPn] = useState('')
  const [capture, setCapture] = useState<AV.Captcha | null>(null)
  const [smsSent, setSmsSent] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [code, setCode] = useState('')
  const { t } = useTranslation()

  const onPhoneNumberFinish = useCallback(() => {
    if (pn.length < 5 || pn.length > 16) {
      toast.error(t('app.auth.errors.pnLen'))
      return
    }
    AV.Captcha.request().then(res => {
      setCapture(res)
    })
  }, [pn])
  const onVerifyCodeInputEnd = useCallback(() => {
    capture?.verify(verifyCode).then(vt => {
      // send verify code
      AV.Cloud.requestSmsCode({
        mobilePhoneNumber: pn,
      }, {
        validateToken: vt
      }).then(res => {
        // something
        toast.success('app.auth.info.smsSent')
        // redirect
        setSmsSent(true)
      }).catch(err => {
        toast.error('app.auth.errors.smsSend')
      })
    }).catch(err => {
      toast.error('app.auth.errors.verifyCode')
      setVerifyCode('')
    })
  }, [capture, verifyCode])
  const onCodeEnd = useCallback(() => {
    if (!smsSent) {
      return
    }
    // do mutation
    // redirect
  }, [smsSent])

  return (
    <section className='anna-page-container flex h-screen items-center justify-center'>
      <Card>
        <div className='w-full flex items-center justify-center rounded'>
          <PhoneInput
            country='cn'
            preferredCountries={['cn']}
            value={pn}
            onChange={v => { setPn(v) }}
            onEnterKeyPress={onPhoneNumberFinish}
            autoFormat={false}
          />
          {capture && (
            <div>
              <img src={capture?.url} />
              <input
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.trim())}
                maxLength={4}
                onBlur={onVerifyCodeInputEnd}
              />
            </div>
          )}
          {smsSent && (
            <div>
              <input
               type='number'
               value={code}
                onChange={e => {
                  const val = e.target.value.trim()
                  setCode(val)
                  if (val.length === 4) {
                    onCodeEnd()
                  }
                }}
                maxLength={6}
                onBlur={onCodeEnd}
               />
            </div>
          )}

        </div>
      </Card>
    </section>
  )
}

export default AuthPhone
