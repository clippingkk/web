import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@reach/router'
import swal from 'sweetalert'
import { useSelector } from 'react-redux'
import { usePageTrack, useActionTrack } from '../../hooks/tracke'
import { extraFile } from '../../store/clippings/creator'
import ClippingTextParser, { TClippingItem } from '../../store/clippings/parser'
import { useApolloClient, useMutation } from '@apollo/client'
import createClippingsQuery from '../../schema/mutations/create-clippings.graphql'
import { AnimateOnChange } from '@nearform/react-animation'
import { createClippings, createClippingsVariables } from '../../schema/mutations/__generated__/createClippings'
import { wenquRequest, WenquSearchResponse } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { UploadStep } from './types'
import LoadingModal from './loading-modal'
import { TGlobalStore } from '../../store'
import Switch from "react-switch"
import ClippingsUploadHelp from './help'
const styles = require('./uploader.css').default

function delay(ms: number) {
  return new Promise((res, rej) => {
    setTimeout(res, ms)
  })
}

function useUploadData(visible: boolean) {
  const { t } = useTranslation()
  const [step, setStep] = useState(UploadStep.None)
  const [count, setCount] = useState(-1)
  const [at, setAt] = useState(-1)
  const [messages, setMessages] = useState<string[]>([t('app.upload.progress.message.open')])
  const wenquSearchResult = useRef(new Map<string, number>())
  const client = useApolloClient()

  const [exec] = useMutation<createClippings, createClippingsVariables>(createClippingsQuery)
  const onUpload = useCallback(async (e: React.DragEvent, v: boolean) => {
    e.preventDefault()
    const file = e.dataTransfer.items[0]

    if (file.kind !== 'file' || file.type !== 'text/plain') {
      swal({
        title: t('app.upload.errors.fileTitle'),
        text: t('app.upload.errors.fileNotFound'),
        icon: 'error',
      })
      return
    }
    let str = ''
    try {
      setStep(UploadStep.Parsing)
      str = await extraFile(file)
    } catch (e) {
      console.error(e, e.toString())
      setStep(UploadStep.Error)
      setMessages(m => m.concat(e.toString()))
      return
    }

    let parsedData: TClippingItem[]
    try {
      const parser = new ClippingTextParser(str)
      parsedData = parser.execute()
    } catch (e) {
      setStep(UploadStep.Error)
      setMessages(['file invalid'])
      return
    }

    setStep(UploadStep.SearchingBook)
    setCount(parsedData.length)

    for (let index in parsedData) {
      const i = parsedData[index]
      setAt(~~index)

      // cache search
      if (wenquSearchResult.current.has(i.title)) {
        const dbId = wenquSearchResult.current.get(i.title)
        if (dbId) {
          i.bookId = dbId.toString()
          continue
        }
      }

      try {
        const resp = await wenquRequest<WenquSearchResponse>(`/books/search?query=${i.title}`)
        if (resp.count > 0) {
          i.bookId = resp.books[0].doubanId.toString()
        }
      } catch (e) {
        setMessages(m => m.concat(e.toString()))
        console.log(e)
      } finally {
        wenquSearchResult.current.set(i.title, i.bookId ? ~~i.bookId : 0)
      }
    }

    setStep(UploadStep.Uploading)
    const chunkedData = parsedData.reduce((result: (TClippingItem[])[], item: TClippingItem, index: number) => {
      if (result[result.length - 1].length % 20 === 0 && index !== 0) {
        result.push([item])
      } else {
        result[result.length - 1].push(item)
      }
      return result
    }, [[]] as TClippingItem[][])
    setCount(chunkedData.length)
    try {
      for (let i = 0; i < chunkedData.length; i++) {
        setAt(i)
        await exec({
          variables: {
            payload: chunkedData[i].map(x => ({ ...x, bookID: x.bookId })),
            visible: v
          }
        })
      }
      setAt(chunkedData.length)
      setStep(UploadStep.Done)
    } catch (e) {
      setStep(UploadStep.Error)
      setMessages(m => m.concat(e.toString()))
    } finally {
      client.resetStore()
    }
  }, [visible])

  useEffect(() => {
    if (step === UploadStep.Done || step === UploadStep.Error) {
      setTimeout(() => {
        setStep(UploadStep.None)
        setMessages([])
      }, 3000)
    }
  }, [step])

  return {
    onUpload,
    step,
    at,
    messages,
    count
  }
}

function useSwitcher() {
  const [isOn, setIsOn] = useState(true)
  const onSwitchChange = useCallback(checked => {
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
  const { onUpload, step, count, at, messages } = useUploadData(isOn)
  const onUploadTrack = useActionTrack('upload')
  const { t } = useTranslation()

  const onDropEnd = useCallback((e: React.DragEvent) => {
    onUploadTrack()
    onUpload(e, isOn)
  }, [onUpload, onUploadTrack, isOn])

  const stopDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const navigate = useNavigate()
  const id = useSelector<TGlobalStore, number>(s => s.user.profile.id)

  useEffect(() => {
    if (step === UploadStep.Done) {
      setTimeout(() => {
        navigate(`/dash/${id}/home`)
      }, 3000)
    }
  }, [step, id])

  return (
    <section className={styles.uploader}>
      <div
        className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm bg-blue-800 bg-opacity-25 ${styles.box}`}
        onDragOver={stopDragOver}
        onDrop={onDropEnd}
      >
        {/* <FontAwesomeIcon icon="cloud-upload-alt" color="#ffffff" size="8x" /> */}
        <span className='text-6xl'>🎈</span>
        <h3 className='text-3xl dark:text-gray-300'>{t('app.upload.tip')}</h3>
      </div>

      <div className='mt-4 w-10/12 mx-auto'>
        <label className='w-full flex items-center justify-around'>
          <span className=' text-xl dark:text-gray-300'>
            <AnimateOnChange>
            {t(`app.upload.private.${isOn ? 'on' : 'off'}`)}
            </AnimateOnChange>
            </span>
          <Switch onChange={onSwitchChange} checked={isOn} />
        </label>
      </div>
      <ClippingsUploadHelp />
      {step !== UploadStep.None && (
        <LoadingModal
          stepAt={step}
          count={count}
          at={at}
          message={messages[0]}
        />
      )}
    </section>
  )
}

export default UploaderPage
