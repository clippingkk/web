import Modal from '@annatarhe/lake-ui/modal'
import { Check, Image as ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import type React from 'react'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslation } from '@/i18n/client'

import { toastPromiseDefaultOption, uploadImage } from '../../services/misc'
import NFTGallary from '../nfts/nft-gallary'

type AvatarPickerProps = {
  uid: number
  onCancel: () => void

  onSubmit: (nextAvatar: string) => Promise<any>
  opened: boolean
}

function AvatarPicker(props: AvatarPickerProps) {
  const { t } = useTranslation()
  const { uid, onCancel, opened, onSubmit } = props
  const [nextImage, setNextImage] = useState<string | File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files?.[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith('image/')) {
          setNextImage(file)
          setPreviewUrl(URL.createObjectURL(file))
        } else {
          toast.error(t('app.common.errors.fileType'))
        }
      }
    },
    [t]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        const file = e.target.files[0]
        setNextImage(file)
        setPreviewUrl(URL.createObjectURL(file))
      }
    },
    []
  )

  const resetSelection = useCallback(() => {
    setNextImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [previewUrl])

  const onConfirm = useCallback(async () => {
    if (!nextImage) {
      toast.error(t('app.common.errors.noImageSelected'))
      return
    }

    if (typeof nextImage === 'string') {
      return onSubmit(nextImage)
    }

    // upload image
    return toast.promise(
      uploadImage(nextImage).then((res) => onSubmit(res.filePath)),
      toastPromiseDefaultOption
    )
  }, [onSubmit, nextImage, t])

  return (
    <Modal title={t('app.auth.avatar')} onClose={onCancel} isOpen={opened}>
      <div className="p-8">
        {/* NFT Gallery Section */}
        <div className="rounded-lg bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-4 backdrop-blur-sm">
          <h3 className="mb-3 text-lg font-bold text-purple-500 dark:text-purple-400">
            {t('app.profile.nftAvatars')}
          </h3>
          <NFTGallary
            uid={uid}
            onPick={(_, realImage) => {
              setNextImage(realImage)
              setPreviewUrl(null)
            }}
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="mx-4 flex-shrink text-sm text-gray-500 dark:text-gray-400">
            {t('app.profile.orUploadManually')}
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        {/* File Upload Section */}
        <div className="relative">
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 dark:border-gray-700'} ${nextImage && previewUrl ? 'bg-gray-100 dark:bg-gray-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'} `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {nextImage && previewUrl ? (
              <div className="relative flex h-48 w-full items-center justify-center">
                <Image
                  src={previewUrl}
                  alt="Avatar preview"
                  className="max-h-full w-auto rounded-lg object-contain shadow-lg"
                  width={150}
                  height={150}
                />
                <button
                  onClick={resetSelection}
                  className="absolute top-0 right-0 rounded-full bg-red-500 p-1 text-white transition-colors duration-200 hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>
              </div>
            ) : nextImage && typeof nextImage !== 'string' ? (
              <div className="px-2 py-4">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <Check size={20} />
                  <span className="max-w-xs truncate font-medium">
                    {(nextImage as File).name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                    <Upload
                      size={32}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('app.profile.dragAndDropHere')}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF {t('app.common.or')} SVG (
                    {t('app.common.maxSize')}: 5MB)
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700">
                  <ImageIcon size={16} className="mr-2" />
                  <span>{t('app.profile.browseFiles')}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/gif,image/svg+xml"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t('app.common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={nextImage === null}
            className={`rounded-lg px-4 py-2 text-white transition-colors duration-200 ${
              nextImage === null
                ? 'cursor-not-allowed bg-blue-400 opacity-50 dark:bg-blue-600'
                : 'bg-blue-600 shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            } `}
          >
            {t('app.common.submit')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AvatarPicker
