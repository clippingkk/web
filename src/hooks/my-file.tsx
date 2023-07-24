import { useApolloClient } from "@apollo/client"
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

const localClippingsStashKey = 'app.stash.clippings'

const uploadProcessMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFUAOAbA9gQwgBQCdMBjOWAWW2IAsBLAOzADp7NGBiAOTAA8AXANoAGALqJQqTLFp9abcSB6IAbMqFMAnACYAjAA4tG5TuUBWHQHZTAGhABPRHp1MALBvcaXpvcr1G9pgC+gbZoWLiEJGSUNAzMqNgEsGBcvIKiCpLSsvJIiog6GgDMTEJFOlrmfqZuyi4utg4Ipt6uJsqGFhYuRaYWesGhGDj4RKSwFFR0jEwJSSkAogREBMJieVkycvQKSgiFJWUVVRo1RvWNiPUl3e5OOjo9QloWgyBhI5Hjk7Ezc8nsABKcDA6XWEikW1yoD2B1K5Uq+lOtQu9kQWmeTC0bncQiERjKui0bw+ETG0SmcSYyUSvygACFMJgANapfhrTKQnI7PJ7DHqFxCDouEwYsw2NEINR6TTtHrlExOEnDMlRCYxabMGkEOmMlnsJYrDkbLnbXZXUwaJjKCz6Kp6FxaDoaS7NCwC9oWYrYjRCEXK8KjNU-TXUsC06YMpms4HJMGc7Jm3kWq02u36B1OwyuopaLSaDz+OrKYqvELvFVB74aqkAV0rDCgbPjJsT0Py+2K8OOSLOdQakp8+ZFZltWgCWiKbgDn3J6spM3rgcbBuWmFWGVbUJ5MIKXaOiOqKIHTRLznalrUll6pmJ5dJVYpv2YS5GK9joONELbO47cIPJx9qiTTdM4qiqPiLQuDaDozqq1YLswEBsCkH4tt+27mggXipraAQZo6zqukObSjhUE5ThocGPvOz5MGAa4EECILoSAmzclhZglDUvhFBofg6L0LqSn0HqqF6uZuH6OjBOWrAQHACgPl8T6agmmHJggAC0yiujp1EqbRoasIw6kcZpXQWJoQoZjoQouP0Og5oYrh1E6dlOno-RBPelaGSGVL-GAZlJruCAWPmBLFF5vSOtBrraKUOIxXoAQ2tOvmBv5NYzNqurRiF7Z8hoVl8UKebOqoBiuqYdSuB4XHKHxDxlkMWVzgFi4NvQUCFb+eyOq6xhWtBqgOUUEVeV6BkdTlSEoX1WFFEU6gRU60ETZUPgSk0JEaCYfTkbelEzcGc30Yxi2abVLjdti5gTS4MU1e6sqqFO442vxVGyUAA */
  id: "UploadProcessMachine",

  states: {
    none: {
      on: {
        Next: "parse"
      }
    },

    parse: {
      on: {
        Next: "searchingBook",
        Error: "error",
        Reset: "none"
      }
    },

    searchingBook: {
      on: {
        Next: "uploading",
        Error: "error",
        Reset: "none"
      }
    },

    uploading: {
      on: {
        Next: "done",
        Error: "error",
        Reset: "none"
      }
    },

    done: {
      on: {
        Reset: "none"
      }
    },

    error: {
      on: {
        Reset: "none"
      }
    },
  },

  initial: "none",
  predictableActionArguments: true,
})

export function useUploadData(
  visible: boolean,
  willSyncServer: boolean
) {
  const { t } = useTranslation()
  const [stepValue, send] = useMachine(uploadProcessMachine)
  const step = stepValue.value
  const [count, setCount] = useState(-1)
  const [at, setAt] = useState(-1)
  const [messages, setMessages] = useState<string[]>([t('app.upload.progress.message.open')])
  const wenquSearchResult = useRef(new Map<string, number>())
  const client = useApolloClient()

  const [exec] = useCreateClippingsMutation()
  const onUpload = useCallback(async (e: React.DragEvent, v: boolean) => {
    e.preventDefault()
    const file = e.dataTransfer.items[0]

    if (file.kind !== 'file' || file.type !== 'text/plain') {
      return
    }
    let str = ''
    try {
      send('Next')
      str = await extraFile(file)
    } catch (e: any) {
      console.error(e, e.toString())
      send('Error')
      setMessages(m => m.concat(e.toString()))
      return
    }
    let parsedData: TClippingItem[]
    try {
      const parser = new ClippingTextParser(str)
      parsedData = parser.execute()
    } catch (e) {
      send('Error')
      setMessages(['file invalid'])
      return
    }

    send('Next')
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
        const searchQuery = i.title
        const rq = getReactQueryClient()
        const resp = await rq.fetchQuery({
          queryKey: ['wenqu', 'books', 'search', searchQuery, 50, 0],
          queryFn: (ctx) => wenquRequest<WenquSearchResponse>(`/books/search?query=${searchQuery}&limit=50&offset=0`, {
            signal: ctx.signal
          }),
          staleTime: duration3Days,
          cacheTime: duration3Days,
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
    send('Next')
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
      send('Next')
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
        await exec({
          variables: {
            payload: chunkedData[i].map(x => ({ ...x, bookID: x.bookId })),
            visible: v
          }
        })
      }
      setAt(chunkedData.length)
      toast.success(t('app.upload.tips.done'))
      send('Next')
    } catch (e: any) {
      send('Error')
      setMessages(m => m.concat(e.toString()))
    } finally {
      client.resetStore()
    }
  }, [client, exec, t, willSyncServer])

  useEffect(() => {
    if (step === UploadStep.Done || step === UploadStep.Error) {
      setTimeout(() => {
        send('Reset')
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
