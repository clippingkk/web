import type { WenquBook } from '@/services/wenqu'

import SharePreview from './share-preview'

export default function BookSharePreview({
  opened,
  onCancel,
  book,
  uid,
}: {
  opened: boolean
  onCancel: () => void
  book: WenquBook | null
  uid: number | null
}) {
  if (!book || uid === null) return null
  return (
    <SharePreview opened={opened} onCancel={onCancel} data={{ book, uid }} />
  )
}
