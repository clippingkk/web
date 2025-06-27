'use client'
import React, { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Modal from '@annatarhe/lake-ui/modal'
import Button from '@/components/button/button'
import { Upload, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface BackgroundUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (imageUrl: string) => void
}

const REQUIRED_WIDTH = 1200
const REQUIRED_HEIGHT = 400
const ASPECT_RATIO = REQUIRED_WIDTH / REQUIRED_HEIGHT

const BackgroundUploadModal = ({ isOpen, onClose, onSave }: BackgroundUploadModalProps) => {
  const [_selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [croppedUrl, setCroppedUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageError, setImageError] = useState<string>('')
  const [crop, setCrop] = useState<Crop | undefined>({
    unit: '%',
    width: 1200,
    height: 400,
    x: 0,
    y: 0,
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setImageError('')
    setCroppedUrl('')
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        ASPECT_RATIO,
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }, [])

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return

    setIsProcessing(true)
    
    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')!

    const pixelRatio = window.devicePixelRatio
    canvas.width = REQUIRED_WIDTH * pixelRatio
    canvas.height = REQUIRED_HEIGHT * pixelRatio
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      REQUIRED_WIDTH,
      REQUIRED_HEIGHT,
    )

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedImageUrl = URL.createObjectURL(blob)
        setCroppedUrl(croppedImageUrl)
      }
      setIsProcessing(false)
    }, 'image/jpeg', 0.9)
  }, [completedCrop])
  const handleClose = useCallback(() => {
    // Clean up URLs
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (croppedUrl) URL.revokeObjectURL(croppedUrl)
    
    // Reset state
    setSelectedFile(null)
    setPreviewUrl('')
    setCroppedUrl('')
    setImageError('')
    setIsProcessing(false)
    setCrop(undefined)
    setCompletedCrop(undefined)
    
    onClose()
  }, [previewUrl, croppedUrl, onClose])


  const handleSave = useCallback(async () => {
    if (!croppedUrl) return

    setIsProcessing(true)
    
    try {
      // Mock API call - replace with actual implementation
      await mockUploadBackground(croppedUrl)
      
      onSave(croppedUrl)
      toast.success('Background updated successfully!')
      handleClose()
    } catch (error) {
      toast.error('Failed to update background')
      console.error('Background upload error:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [croppedUrl, onSave, handleClose])

  // Mock API call function
  const mockUploadBackground = async (imageUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Mock API: Background image uploaded:', imageUrl)
        resolve()
      }, 1000)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Change Background Image'>
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Upload an image for your profile background. Image will be resized to {REQUIRED_WIDTH}x{REQUIRED_HEIGHT}px.
          </div>
            
          <div className="flex flex-col space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
              
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Image
            </Button>
              
            {imageError && (
              <div className="text-red-500 text-sm">{imageError}</div>
            )}
          </div>
        </div>

        {/* Image Crop */}
        {previewUrl && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Crop Image to {REQUIRED_WIDTH}x{REQUIRED_HEIGHT}px:
            </div>
            <div className="relative max-h-96 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={ASPECT_RATIO}
                maxWidth={1200}
                maxHeight={400}
                keepSelection
                locked
              >
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-96 object-contain"
                  style={{ width: 1200 }}
                />
              </ReactCrop>
            </div>
              
            <Button
              onClick={generateCroppedImage}
              disabled={!completedCrop || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Generate Preview'}
            </Button>
          </div>
        )}

        {/* Cropped Preview */}
        {croppedUrl && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cropped Preview ({REQUIRED_WIDTH}x{REQUIRED_HEIGHT}px):
            </div>
            <div className="relative">
              <img
                src={croppedUrl}
                alt="Cropped preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!croppedUrl || isProcessing}
        >
          <Save className="w-4 h-4 mr-2" />
          {isProcessing ? 'Saving...' : 'Save Background'}
        </Button>
      </div>
    </Modal>
  )
}

export default BackgroundUploadModal
