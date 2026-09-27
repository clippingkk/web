'use client'

import Button from '@annatarhe/lake-ui/button'
import { Share2 } from 'lucide-react'
import { useState } from 'react'

import BookSharePreview from '@/components/preview/preview-book'
import type { WenquBook } from '@/services/wenqu'

type BookShareButtonProps = {
  book: WenquBook
  /** Owner of the shelf; the poster's QR code links to their book page. */
  uid: number
  label: string
}

function BookShareButton({ book, uid, label }: BookShareButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="primary"
        size="sm"
        leadingIcon={<Share2 className="size-4" />}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <BookSharePreview
        opened={open}
        onCancel={() => setOpen(false)}
        book={book}
        uid={uid}
      />
    </>
  )
}

export default BookShareButton
