import { useApolloClient, useMutation } from "@apollo/client"
import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { UploadStep } from "../pages/uploader/types"
import { createClippings, createClippingsVariables } from "../schema/mutations/__generated__/createClippings"
import { wenquRequest, WenquSearchResponse } from "../services/wenqu"
import swal from 'sweetalert'
import createClippingsQuery from '../schema/mutations/create-clippings.graphql'
import { extraFile } from "../store/clippings/creator"
import ClippingTextParser, { TClippingItem } from "../store/clippings/parser"
import { useNavigate } from "@reach/router"
import { useSelector } from "react-redux"
import { TGlobalStore } from "../store"
import { toast } from "react-toastify"

const localClippingsStashKey = 'app.stash.clippings'

export function useUploadData(
  visible: boolean,
  willSyncServer: boolean
) {
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
    if (!willSyncServer) {
      // 这里会覆盖之前的数据，后续可以考虑是不是弄个队列
      localStorage.setItem(localClippingsStashKey, JSON.stringify(chunkedData))
      setStep(UploadStep.Done)
      await swal({
        icon: 'success',
        title: t('app.upload.tips.parsedInfoTitle'),
        content: t('app.upload.tips.parsedInfoContent'),
      })
      return
    }

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

export function useSyncClippingsToServer() {
  const id = useSelector<TGlobalStore, number>(s => s.user.profile.id)
  const { t } = useTranslation()
  const [exec, { client }] = useMutation<createClippings, createClippingsVariables>(createClippingsQuery)
  useEffect(() => {
    console.log('try to sync data...')
    if (!id) {
      return
    }
    const stashData = localStorage.getItem(localClippingsStashKey)
    if (!stashData) {
      return
    }
    let stashClippings: TClippingItem[][] = []

    try {
      stashClippings = JSON.parse(stashData)
    } catch (e) {
      toast.error(t('app.upload.errors.parse'))
    }

    if (stashClippings.length === 0) {
      return
    }

    // TODO: add locking
    toast.info(t('app.upload.tips.backUpload'))

    const requests = stashClippings.map((s => exec({
      variables: {
        payload: s.map(x => ({ ...x, bookID: x.bookId })),
        visible: true
      }
    })))

    Promise.all(requests)
      .then(() => {
        toast.success(t('app.upload.tips.done'))
        localStorage.removeItem(localClippingsStashKey)
      })
      .catch(e => {
        toast.error(e.toString())
      })
      .finally(() => {
        client.resetStore()
      })
  }, [id])
}
