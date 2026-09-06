import type { WenquBook } from '@/services/wenqu'

import type { ShareClipping } from './share-poster'
import SharePreview from './share-preview'

export default function Preview({
  visible,
  onCancel,
  clipping,
  book,
}: {
  visible: boolean
  onCancel: () => void
  clipping: ShareClipping
  book: WenquBook | null
}) {
  if (!book) return null
  return (
    <SharePreview
      opened={visible}
      onCancel={onCancel}
      data={{ clipping, book, uid: clipping.creator.id }}
    />
  )
}
