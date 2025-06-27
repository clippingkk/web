'use client'
import React, { useState, useRef, useCallback } from 'react'
import Modal from '@annatarhe/lake-ui/modal'
import Button from '@/components/button/button'
import { Upload, Crop, Save } from 'lucide-react'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [croppedUrl, setCroppedUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageError, setImageError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  const handleCrop = useCallback(() => {
    if (!selectedFile || !canvasRef.current) return

    setIsProcessing(true)
    
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      
      // Set canvas size to required dimensions
      canvas.width = REQUIRED_WIDTH
      canvas.height = REQUIRED_HEIGHT
      
      // Calculate crop dimensions to maintain aspect ratio
      const imgAspectRatio = img.width / img.height
      let cropWidth, cropHeight, offsetX = 0, offsetY = 0
      
      if (imgAspectRatio > ASPECT_RATIO) {
        // Image is wider than required aspect ratio
        cropHeight = img.height
        cropWidth = cropHeight * ASPECT_RATIO
        offsetX = (img.width - cropWidth) / 2
      } else {
        // Image is taller than required aspect ratio
        cropWidth = img.width
        cropHeight = cropWidth / ASPECT_RATIO
        offsetY = (img.height - cropHeight) / 2
      }
      
      // Draw the cropped image
      ctx.drawImage(
        img,
        offsetX, offsetY, cropWidth, cropHeight,
        0, 0, REQUIRED_WIDTH, REQUIRED_HEIGHT
      )
      
      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob)
          setCroppedUrl(croppedImageUrl)
        }
        setIsProcessing(false)
      }, 'image/jpeg', 0.9)
    }
    
    img.src = previewUrl
  }, [selectedFile, previewUrl])
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

        {/* Image Preview */}
        {previewUrl && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Original Image:
            </div>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
              
            <Button
              onClick={handleCrop}
              disabled={isProcessing}
              className="w-full"
            >
              <Crop className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Crop to Size'}
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
