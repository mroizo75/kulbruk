'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Maximize2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  showThumbnails?: boolean
  allowDownload?: boolean
  allowShare?: boolean
}

export default function ImageGallery({
  images,
  alt = 'Bilde',
  className = '',
  aspectRatio = 'auto',
  showThumbnails = true,
  allowDownload = false,
  allowShare = false
}: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  if (!images || images.length === 0) {
    return (
      <Card className={`bg-gray-100 ${className}`}>
        <CardContent className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <ZoomIn className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Ingen bilder tilgjengelig</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentImage = images[currentImageIndex]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    resetImageControls()
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    resetImageControls()
  }

  const resetImageControls = () => {
    setZoom(1)
    setRotation(0)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bilde-${currentImageIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Bilde lastet ned')
    } catch (error) {
      toast.error('Feil ved nedlasting av bilde')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: alt,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link kopiert til utklippstavle')
      }
    } catch (error) {
      toast.error('Feil ved deling')
    }
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      default:
        return 'aspect-[4/3]'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hovedbilde */}
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <div className={`relative ${getAspectClass()} bg-gray-100`}>
            <Image
              src={currentImage}
              alt={`${alt} ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority={currentImageIndex === 0}
            />
            
            {/* Navigeringsknapper */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Bildteller */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-black/50 text-white border-0">
                  {currentImageIndex + 1} / {images.length}
                </Badge>
              </div>
            )}
            
            {/* Zoom-knapp */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
                <div className="relative h-[80vh] bg-black">
                  <Image
                    src={currentImage}
                    alt={`${alt} ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease'
                    }}
                  />
                  
                  {/* Fullskjerm-kontroller */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={() => setRotation(prev => prev + 90)}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    {allowDownload && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {allowShare && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Fullskjerm navigering */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-black/50 text-white border-0">
                          {currentImageIndex + 1} / {images.length}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index)
                resetImageControls()
              }}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Bildeinfo */}
      <div className="text-sm text-gray-600 flex items-center justify-between">
        <span>{images.length} bilde{images.length !== 1 ? 'r' : ''}</span>
        <div className="flex gap-2">
          {allowDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-gray-600 hover:text-gray-900"
            >
              <Download className="h-4 w-4 mr-1" />
              Last ned
            </Button>
          )}
          {allowShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-600 hover:text-gray-900"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Del
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
