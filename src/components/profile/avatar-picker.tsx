'use client'

import Button from '@annatarhe/lake-ui/button'
import Modal from '@annatarhe/lake-ui/modal'
import Tabs, { TabPanel } from '@annatarhe/lake-ui/tabs'
import { ImageUp, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { uploadImage } from '@/services/misc'

import NFTGallary from '../nfts/nft-gallary'

type AvatarPickerProps = {
  uid: number
  opened: boolean
  onCancel: () => void
  onSubmit: (nextAvatar: string) => Promise<unknown>
}

type Picked =
  | { kind: 'file'; file: File; preview: string }
  | { kind: 'nft'; url: string; tokenID: string }

const MAX_BYTES = 5 * 1024 * 1024

function AvatarPicker({ uid, opened, onCancel, onSubmit }: AvatarPickerProps) {
  const { t } = useTranslation(undefined, 'profile')
  const [tab, setTab] = useState<'upload' | 'nft'>('upload')
  const [picked, setPicked] = useState<Picked | null>(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(
    () => () => {
      if (picked?.kind === 'file') URL.revokeObjectURL(picked.preview)
    },
    [picked]
  )

  const pickFile = (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > MAX_BYTES) {
      toast.error(t('avatar.wrongType'))
      return
    }
    setPicked({ kind: 'file', file, preview: URL.createObjectURL(file) })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  const onConfirm = async () => {
    if (!picked) return
    setSaving(true)
    try {
      const url =
        picked.kind === 'nft'
          ? picked.url
          : (await uploadImage(picked.file)).filePath
      await onSubmit(url)
      toast.success(t('avatar.saved'))
      onCancel()
    } catch {
      toast.error(t('avatar.failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={opened}
      onClose={onCancel}
      title={t('avatar.title')}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {t('avatar.cancel')}
          </Button>
          <Button
            variant="primary"
            loading={saving}
            disabled={!picked || saving}
            onClick={onConfirm}
          >
            {t('avatar.save')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Tabs
          aria-label={t('avatar.title')}
          idBase="avatar-picker"
          variant="pill"
          size="sm"
          value={tab}
          onValueChange={setTab}
          items={[
            { value: 'upload', label: t('avatar.upload') },
            { value: 'nft', label: t('avatar.nft') },
          ]}
        />
        <TabPanel idBase="avatar-picker" value="upload" activeValue={tab}>
          {picked?.kind === 'file' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={picked.preview}
                  alt=""
                  className="border-lake-line size-40 rounded-full border object-cover"
                />
                <button
                  type="button"
                  aria-label={t('avatar.remove')}
                  onClick={() => setPicked(null)}
                  className="bg-lake-surface-raised text-lake-fg-muted border-lake-line hover:text-lake-fg focus-visible:ring-lake-ring absolute top-1 right-1 rounded-full border p-1 transition-colors duration-150 outline-none focus-visible:ring-2"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p className="type-meta truncate">{picked.file.name}</p>
            </div>
          ) : (
            <div
              onDragEnter={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                'rounded-lake-panel flex flex-col items-center gap-3 border border-dashed px-6 py-10 text-center transition-colors duration-150 focus-within:ring-2 focus-within:ring-lake-ring',
                dragging
                  ? 'border-lake-accent bg-lake-accent-soft'
                  : 'border-lake-line-strong hover:bg-lake-surface-muted/60'
              )}
            >
              <ImageUp
                className="text-lake-fg-subtle size-7"
                aria-hidden="true"
              />
              <label className="text-lake-fg cursor-pointer text-sm">
                {t('avatar.drop')}{' '}
                <span className="text-lake-accent-text font-medium underline-offset-4 hover:underline">
                  {t('avatar.browse')}
                </span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/gif,image/svg+xml"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </label>
              <span className="type-meta">{t('avatar.hint')}</span>
            </div>
          )}
        </TabPanel>
        <TabPanel idBase="avatar-picker" value="nft" activeValue={tab}>
          <NFTGallary
            uid={uid}
            emptyLabel={t('avatar.nftEmpty')}
            selectedTokenID={picked?.kind === 'nft' ? picked.tokenID : null}
            onPick={(nft, url) =>
              setPicked({ kind: 'nft', url, tokenID: nft.tokenID })
            }
          />
        </TabPanel>
      </div>
    </Modal>
  )
}

export default AvatarPicker
