'use client'

import { Share2 } from 'lucide-react'
import { useCallback, useState } from 'react'

import type { WenquBook } from '@/services/wenqu'

import BookSharePreview from '../preview/preview-book'

type BookShareActionProps = {
  book: WenquBook
  uid: number
  label: string
  className?: string
  iconClassName?: string
}

function BookShareAction({
  book,
  uid,
  label,
  className,
  iconClassName,
}: BookShareActionProps) {
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible((visible) => !visible)
  }, [])

  return (
    <>
      <button onClick={togglePreviewVisible} className={className}>
        <Share2 className={iconClassName} />
        <span>{label}</span>
      </button>

      <BookSharePreview
        onCancel={togglePreviewVisible}
        onOk={togglePreviewVisible}
        background={book.image}
        opened={sharePreviewVisible}
        book={book}
        uid={uid}
      />
    </>
  )
}

export default BookShareAction
