'use client'

import type { ClippingData } from '@annatarhe/clippingkk-widget'
import Button from '@annatarhe/lake-ui/button'
import IconButton from '@annatarhe/lake-ui/icon-button'
import Menu, { type MenuEntry } from '@annatarhe/lake-ui/menu'
import { useMutation } from '@apollo/client/react'
import {
  BookMarked,
  CodeXml,
  Ellipsis,
  ExternalLink,
  Globe,
  Link2,
  Lock,
  Share2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import BookMatchSheet from '@/components/book/book-match-sheet'
import Preview from '@/components/preview/preview3'
import type { ShareClipping } from '@/components/preview/share-poster'
import { ToggleClippingVisibleDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import type { WenquBook } from '@/services/wenqu'
import { clippingHref } from '@/utils/profile.utils'

type ClippingActionsProps = {
  clipping: ShareClipping & { pageAt?: string | null; visible: boolean }
  book: WenquBook | null
  creatorSlug: string
  isOwner: boolean
}

function embedSnippet(
  clipping: ClippingActionsProps['clipping'],
  book: WenquBook | null
) {
  const data: Partial<ClippingData> = {
    id: clipping.id.toString(),
    content: clipping.content,
    book: book?.title ?? clipping.title,
    author: book?.author ?? '',
    location: clipping.pageAt ?? '',
    createdAt: clipping.createdAt,
    creator: {
      id: clipping.creator.id.toString(),
      name: clipping.creator.name,
      avatar: clipping.creator.avatar,
    },
  }
  return `<clippingkk-web-widget
  clippingid="${clipping.id}"
  theme="light"
  clippingdata='${JSON.stringify(data).replaceAll("'", '&#39;')}'>
</clippingkk-web-widget>`
}

function ClippingActions(props: ClippingActionsProps) {
  const { clipping, book, creatorSlug, isOwner } = props
  const { t } = useTranslation(undefined, 'reading')
  const router = useRouter()
  const [shareOpen, setShareOpen] = useState(false)
  const [matchOpen, setMatchOpen] = useState(false)
  const [visible, setVisible] = useState(clipping.visible)
  const [toggleVisible] = useMutation(ToggleClippingVisibleDocument)

  const copy = async (text: string, success: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(success)
    } catch {
      toast.error(t('actions.copyFailed'))
    }
  }

  const setVisibility = async (next: boolean) => {
    if (next === visible) return
    setVisible(next)
    try {
      await toggleVisible({ variables: { ids: [clipping.id] } })
      toast.success(next ? t('actions.madePublic') : t('actions.madePrivate'))
      router.refresh()
    } catch {
      setVisible(!next)
      toast.error(t('actions.visibilityFailed'))
    }
  }

  const items: MenuEntry[] = [
    {
      key: 'copy-link',
      label: t('actions.copyLink'),
      icon: <Link2 className="size-4" />,
      onSelect: () =>
        copy(
          `${window.location.origin}${clippingHref(creatorSlug, clipping.id)}`,
          t('actions.linkCopied')
        ),
    },
    {
      key: 'embed',
      label: t('actions.embed'),
      icon: <CodeXml className="size-4" />,
      onSelect: () =>
        copy(embedSnippet(clipping, book), t('actions.embedCopied')),
    },
    ...(book?.url
      ? [
          {
            key: 'douban',
            label: t('actions.douban'),
            icon: <ExternalLink className="size-4" />,
            onSelect: () => window.open(book.url, '_blank', 'noopener'),
          } satisfies MenuEntry,
        ]
      : []),
    ...(isOwner
      ? ([
          { type: 'separator', key: 'sep-owner' },
          { type: 'label', key: 'visibility', label: t('actions.visibility') },
          {
            type: 'radio',
            key: 'public',
            label: (
              <span className="inline-flex items-center gap-2">
                <Globe className="size-4" />
                {t('actions.public')}
              </span>
            ),
            checked: visible,
            onSelect: () => setVisibility(true),
          },
          {
            type: 'radio',
            key: 'private',
            label: (
              <span className="inline-flex items-center gap-2">
                <Lock className="size-4" />
                {t('actions.private')}
              </span>
            ),
            checked: !visible,
            onSelect: () => setVisibility(false),
          },
          { type: 'separator', key: 'sep-book' },
          {
            key: 'change-book',
            label: t('actions.changeBook'),
            icon: <BookMarked className="size-4" />,
            onSelect: () => setMatchOpen(true),
          },
        ] satisfies MenuEntry[])
      : []),
  ]

  return (
    <div className="flex items-center gap-2">
      {book ? (
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Share2 className="size-4" />}
          onClick={() => setShareOpen(true)}
        >
          {t('actions.share')}
        </Button>
      ) : null}
      <Menu
        label={t('actions.more')}
        trigger={
          <IconButton
            variant="ghost"
            size="sm"
            label={t('actions.more')}
            icon={<Ellipsis className="size-4" />}
          />
        }
        items={items}
      />
      {book ? (
        <Preview
          visible={shareOpen}
          onCancel={() => setShareOpen(false)}
          clipping={clipping}
          book={book}
        />
      ) : null}
      {isOwner && matchOpen ? (
        <BookMatchSheet
          open={matchOpen}
          onClose={() => setMatchOpen(false)}
          clippingId={clipping.id}
          title={clipping.title}
        />
      ) : null}
    </div>
  )
}

export default ClippingActions
