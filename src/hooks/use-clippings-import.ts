import { useApolloClient, useMutation } from '@apollo/client/react'
import { useMachine } from '@xstate/react'
import { useCallback, useState } from 'react'

import { CreateClippingsDocument, OnSyncEndDocument } from '@/gql/graphql'
import { getQueryGcTime } from '@/services/query-client'

import { getReactQueryClient } from '../services/ajax'
import { UploadStep } from '../services/uploader'
import { type WenquSearchResponse, wenquRequest } from '../services/wenqu'
import { toClippingInput } from '../store/clippings/creator'
import ClippingTextParser, {
  type TClippingItem,
} from '../store/clippings/parser'
import { digestMessage } from '../utils/crypto'
import { duration3Days } from './book'
import { uploadProcessMachine } from './my-file.machine'

const UPLOADED_KEY = 'app.uploaded.clippings'
const BATCH_SIZE = 20

type ImportErrorKind = 'read' | 'parse' | 'search' | 'upload'
export type ImportError = { kind: ImportErrorKind; message: string }

export type ImportResult = {
  /** Highlights sent to the server in this run. */
  imported: number
  /** Highlights skipped because this browser imported them before. */
  duplicates: number
}

function readUploaded(): Set<string> {
  try {
    const raw = localStorage.getItem(UPLOADED_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function saveUploaded(digests: Set<string>) {
  try {
    localStorage.setItem(UPLOADED_KEY, JSON.stringify([...digests]))
  } catch {
    // quota or privacy mode: the server dedupes on data_id anyway
  }
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

async function findDoubanId(title: string): Promise<string | null> {
  const rq = getReactQueryClient()
  const resp = await rq.fetchQuery({
    queryKey: ['wenqu', 'books', 'search', title, 50, 0],
    queryFn: (ctx) =>
      wenquRequest<WenquSearchResponse>(
        `/books/search?query=${encodeURIComponent(title)}&limit=50&offset=0`,
        { signal: ctx.signal }
      ),
    staleTime: duration3Days,
    gcTime: getQueryGcTime(duration3Days),
  })
  return resp.count > 0 ? String(resp.books[0].doubanId) : null
}

/**
 * Parses a Kindle "My Clippings.txt", matches each title to a Douban book,
 * and uploads new highlights in batches. `at`/`count` count highlights while
 * matching books and batches while uploading.
 */
export function useClippingsImport() {
  const [state, send] = useMachine(uploadProcessMachine)
  const step = state.value as UploadStep
  const [count, setCount] = useState(0)
  const [at, setAt] = useState(0)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const client = useApolloClient()
  const [createClippings] = useMutation(CreateClippingsDocument)
  const [onSyncEnd] = useMutation(OnSyncEndDocument)

  const fail = useCallback(
    (kind: ImportErrorKind, error: unknown) => {
      setErrors((list) => list.concat({ kind, message: messageOf(error) }))
      send({ type: 'Error' })
    },
    [send]
  )

  const start = useCallback(
    async (file: File, options: { visible: boolean }) => {
      const startedAt = Date.now()
      setErrors([])
      setResult(null)
      setAt(0)
      setCount(0)
      send({ type: 'Next' })

      let items: (TClippingItem & { digest: string })[]
      try {
        const text = await file.text()
        const parsed = new ClippingTextParser(text).execute()
        const digests = await Promise.all(
          parsed.map((item) => digestMessage(JSON.stringify(item)))
        )
        items = parsed.map((item, i) => ({ ...item, digest: digests[i] }))
      } catch (error) {
        fail('parse', error)
        return
      }

      const uploaded = readUploaded()
      const fresh = items.filter((item) => !uploaded.has(item.digest))
      const duplicates = items.length - fresh.length

      send({ type: 'Next' })
      setCount(fresh.length)
      const byTitle = new Map<string, string | null>()
      for (let i = 0; i < fresh.length; i++) {
        setAt(i + 1)
        const item = fresh[i]
        if (!byTitle.has(item.title)) {
          try {
            byTitle.set(item.title, await findDoubanId(item.title))
          } catch (error) {
            byTitle.set(item.title, null)
            setErrors((list) =>
              list.concat({ kind: 'search', message: messageOf(error) })
            )
          }
        }
        const doubanId = byTitle.get(item.title)
        if (doubanId) item.bookId = doubanId
      }

      send({ type: 'Next' })
      const batches: (typeof fresh)[] = []
      for (let i = 0; i < fresh.length; i += BATCH_SIZE) {
        batches.push(fresh.slice(i, i + BATCH_SIZE))
      }
      setAt(0)
      setCount(batches.length)
      try {
        for (let i = 0; i < batches.length; i++) {
          await createClippings({
            variables: {
              payload: batches[i].map(toClippingInput),
              visible: options.visible,
            },
          })
          for (const item of batches[i]) uploaded.add(item.digest)
          saveUploaded(uploaded)
          setAt(i + 1)
        }
        if (batches.length > 0) {
          await onSyncEnd({
            variables: { startedAt: Math.floor(startedAt / 1000) },
          })
        }
      } catch (error) {
        fail('upload', error)
        return
      } finally {
        void client.resetStore()
      }

      setResult({ imported: fresh.length, duplicates })
      send({ type: 'Next' })
    },
    [client, createClippings, fail, onSyncEnd, send]
  )

  const reset = useCallback(() => {
    setErrors([])
    setResult(null)
    setAt(0)
    setCount(0)
    send({ type: 'Reset' })
  }, [send])

  return { step, at, count, errors, result, start, reset }
}
