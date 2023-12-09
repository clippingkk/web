import { useApolloClient, useMutation } from "@apollo/client"
import { createMachine } from 'xstate'
import { useMachine } from '@xstate/react'
import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { UploadStep } from "../services/uploader"
import { wenquRequest, WenquSearchResponse } from "../services/wenqu"
import { extraFile } from "../store/clippings/creator"
import ClippingTextParser, { TClippingItem } from "../store/clippings/parser"
import { useSelector } from "react-redux"
import { TGlobalStore } from "../store"
import { toast } from 'react-hot-toast'
import { useCreateClippingsMutation } from "../schema/generated"
import { getReactQueryClient } from "../services/ajax"
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { duration3Days } from "./book"
import { notifications } from "@mantine/notifications"
import { graphql } from '../gql'
import { delay } from "../utils/timer"
import { digestMessage } from '../utils/crypto'
import { uploadProcessMachine } from "./my-file.machine"


type digestedClippingItem = TClippingItem & { _digest?: string }

const localClippingsStashKey = 'app.stash.clippings'

const onSyncEndMutation = graphql(`
  mutation onSyncEnd($startedAt: Int!) {
    onCreateClippingEnd(startedAt: $startedAt)
  }
`)

export function useUploadData(
  visible: boolean,
  willSyncServer: boolean
) {
  const { t } = useTranslation()
  const [stepValue, send] = useMachine(uploadProcessMachine)
  const step = stepValue.value as UploadStep
  const [count, setCount] = useState(-1)
  const [at, setAt] = useState(-1)
  const [messages, setMessages] = useState<string[]>([t('app.upload.progress.message.open')])
  const wenquSearchResult = useRef(new Map<string, number>())
  const client = useApolloClient()

  const [exec] = useCreateClippingsMutation()
  const [onSyncEnd] = useMutation(onSyncEndMutation)

  const onUpload = useCallback(async (e: React.DragEvent, v: boolean) => {
    e.preventDefault()
    const file = e.dataTransfer.items[0]
    const startedAt = Date.now()
    if (file.kind !== 'file' || file.type !== 'text/plain') {
      return
    }
    let str = ''
    try {
      send({ type: 'Next' })
      str = await extraFile(file)
    } catch (e: any) {
      console.error(e, e.toString())
      send({ type: 'Error' })
      setMessages(m => m.concat(e.toString()))
      return
    }

    let parsedData: digestedClippingItem[]
    try {
      const parser = new ClippingTextParser(str)
      parsedData = parser.execute()
    } catch (e) {
      send({ type: 'Error' })
      setMessages(['file invalid'])
      return
    }

    send({ type: 'Next' })

    let uploadedClippings = new Set<string>()
    const uploadedClippingValue = localStorage.getItem('app.uploaded.clippings')
    if (uploadedClippingValue) {
      try {
        const v = JSON.parse(uploadedClippingValue) as string[]
        uploadedClippings = new Set(v)
      } catch (e) {
        console.error(e)
      }
    }
    const allDigests = await Promise.all(
      parsedData.map(
        i => digestMessage(JSON.stringify(i))
      )
    )
    parsedData.forEach((i, index) => {
      i._digest = allDigests[index]
    })

    // only uploaded clippings that have not been uploaded
    parsedData = parsedData.filter((i) => !uploadedClippings.has(i._digest!))

    setCount(parsedData.length)

    // get ready for book info
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
        const searchQuery = i.title
        const rq = getReactQueryClient()
        const resp = await rq.fetchQuery({
          queryKey: ['wenqu', 'books', 'search', searchQuery, 50, 0],
          queryFn: (ctx) => wenquRequest<WenquSearchResponse>(`/books/search?query=${searchQuery}&limit=50&offset=0`, {
            signal: ctx.signal
          }),
          staleTime: duration3Days,
          gcTime: duration3Days,
        })
        if (resp.count > 0) {
          i.bookId = resp.books[0].doubanId.toString()
        }
      } catch (e: any) {
        setMessages(m => m.concat(e.toString()))
      } finally {
        wenquSearchResult.current.set(i.title, i.bookId ? ~~i.bookId : 0)
      }
    }
    send({ type: 'Next' })
    // cache
    const chunkedData = parsedData.reduce((result, item, index) => {
      if (result[result.length - 1].length % 20 === 0 && index !== 0) {
        result.push([item])
      } else {
        result[result.length - 1].push(item)
      }
      return result
    }, [[]] as digestedClippingItem[][])
    setCount(chunkedData.length)
    if (!willSyncServer) {
      // 这里会覆盖之前的数据，后续可以考虑是不是弄个队列
      localStorage.setItem(localClippingsStashKey, JSON.stringify(chunkedData))
      send({ type: 'Next' })
      notifications.show({
        icon: (<CheckCircleIcon className="w-4 h-4" />),
        title: t('app.upload.tips.parsedInfoTitle'),
        message: t('app.upload.tips.parsedInfoContent'),
      })
      return
    }

    try {
      for (let i = 0; i < chunkedData.length; i++) {
        setAt(i)
        if (chunkedData[i].length === 0) {
          continue
        }
        await exec({
          variables: {
            payload: chunkedData[i].map(x => ({ ...x, bookID: x.bookId })),
            visible: v
          }
        })

        // skip uploaded clippings in next time
        chunkedData.forEach(x => {
          x.forEach(v => {
            uploadedClippings.add(v._digest!)
          })
        })
      }
      localStorage.setItem(
        'app.uploaded.clippings', JSON.stringify(Array.from(uploadedClippings))
      )

      await onSyncEnd({
        variables: {
          startedAt: ~~(startedAt / 1000)
        }
      })

      setAt(chunkedData.length)
      toast.success(t('app.upload.tips.done'))
      send({ type: 'Next' })
    } catch (e: any) {
      send({ type: 'Error' })
      setMessages(m => m.concat(e.toString()))
    } finally {
      client.resetStore()
    }
  }, [client, exec, t, willSyncServer])

  useEffect(() => {
    if (step === UploadStep.Error) {
      setTimeout(() => {
        send({ type: 'Reset' })
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
  const [exec, { client }] = useCreateClippingsMutation()
  useEffect(() => {
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

    const tl = toast.loading(t('app.upload.tips.backUpload'))

    const requests = stashClippings.map((s => exec({
      variables: {
        payload: s.map(x => ({ ...x, bookID: x.bookId })),
        visible: true
      }
    })))

    Promise.all(requests)
      .then(() => {
        toast.success(t('app.upload.tips.done'), { id: tl })
        localStorage.removeItem(localClippingsStashKey)
      })
      .catch(e => {
        toast.error(e.toString(), { id: tl })
      })
      .finally(() => {
        client.resetStore()
      })
  }, [id])
}
