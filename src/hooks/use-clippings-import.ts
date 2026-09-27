import { useApolloClient, useMutation } from '@apollo/client/react'
import { useMachine } from '@xstate/react'
import { useCallback, useRef, useState } from 'react'

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
const LOOKUP_CONCURRENCY = 4

type FatalErrorKind = 'read' | 'parse' | 'upload'
type ImportErrorKind = FatalErrorKind | 'search'
export type ImportError = { kind: ImportErrorKind; message: string }

/** The step each fatal error stops the import at. */
const FAILED_AT: Record<FatalErrorKind, UploadStep> = {
  read: UploadStep.Parse,
  parse: UploadStep.Parse,
  upload: UploadStep.Uploading,
}

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

function saveUploaded(digests: string[]) {
  try {
    // merge with what's stored, so another tab's import keeps its record
    const merged = readUploaded()
    for (const digest of digests) merged.add(digest)
    localStorage.setItem(UPLOADED_KEY, JSON.stringify([...merged]))
  } catch {
    // quota or privacy mode: the server dedupes on data_id anyway
  }
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

/** Runs `task` over `items`, at most `limit` at a time. */
async function forEachLimit<T>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<void>
) {
  let next = 0
  const worker = async () => {
    while (next < items.length) await task(items[next++])
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  )
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
 * and uploads new highlights in batches. `at`/`count` count books while
 * matching and batches while uploading.
 */
export function useClippingsImport() {
  const [state, send] = useMachine(uploadProcessMachine)
  const step = state.value as UploadStep
  const [count, setCount] = useState(0)
  const [at, setAt] = useState(0)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [failedStep, setFailedStep] = useState<UploadStep | null>(null)
  const client = useApolloClient()
  const [createClippings] = useMutation(CreateClippingsDocument)
  const [onSyncEnd] = useMutation(OnSyncEndDocument)

  const fail = useCallback(
    (kind: FatalErrorKind, error: unknown) => {
      setErrors((list) => list.concat({ kind, message: messageOf(error) }))
      setFailedStep(FAILED_AT[kind])
      send({ type: 'Error' })
    },
    [send]
  )

  const run = useCallback(
    async (file: File, options: { visible: boolean }) => {
      const startedAt = Date.now()
      // a finished or failed run parks the machine until Reset
      send({ type: 'Reset' })
      setErrors([])
      setResult(null)
      setFailedStep(null)
      setAt(0)
      setCount(0)
      send({ type: 'Next' })

      let text: string
      try {
        text = await file.text()
      } catch (error) {
        fail('read', error)
        return
      }

      let items: (TClippingItem & { digest: string })[]
      try {
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
      const titles = [...new Set(fresh.map((item) => item.title))]
      setCount(titles.length)
      const byTitle = new Map<string, string | null>()
      let matched = 0
      await forEachLimit(titles, LOOKUP_CONCURRENCY, async (title) => {
        try {
          byTitle.set(title, await findDoubanId(title))
        } catch (error) {
          byTitle.set(title, null)
          setErrors((list) =>
            list.concat({ kind: 'search', message: messageOf(error) })
          )
        }
        setAt(++matched)
      })
      for (const item of fresh) {
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
          saveUploaded(batches[i].map((item) => item.digest))
          setAt(i + 1)
        }
        if (batches.length > 0) {
          // best-effort: the highlights are saved either way, and a retry
          // would find nothing new to send it for
          await onSyncEnd({
            variables: { startedAt: Math.floor(startedAt / 1000) },
          }).catch(() => undefined)
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

  const running = useRef(false)
  // One import at a time: a second run would race the first's progress and
  // its dedupe record.
  const start = useCallback(
    (file: File, options: { visible: boolean }) => {
      if (running.current) return Promise.resolve()
      running.current = true
      return run(file, options).finally(() => {
        running.current = false
      })
    },
    [run]
  )

  const reset = useCallback(() => {
    setErrors([])
    setResult(null)
    setFailedStep(null)
    setAt(0)
    setCount(0)
    send({ type: 'Reset' })
  }, [send])

  return { step, at, count, errors, result, failedStep, start, reset }
}
