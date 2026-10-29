import { noStore } from '@/app/api/auth/native/shared'
import { requireUserId } from '@/server/auth'
import { listReaderNotes } from '@/server/email-import/notes'
import { options, route } from '@/server/http'

/** The reader's newest Kindle notes, as Settings → Notes lists them. */
export const GET = route(async (request) => {
  const userId = await requireUserId(request)
  return noStore(await listReaderNotes(userId))
}, 'email_import.notes.list')

export const OPTIONS = options
