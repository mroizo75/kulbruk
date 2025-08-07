'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  RotateCcw, 
  ZoomIn,
  Move,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
  size: number
  uploaded: boolean
  error?: string
}

interface ImageUploadProps {
  maxImages?: number
  maxFileSize?: number // MB
  acceptedTypes?: string[]
  onImagesChange: (images: UploadedImage[]) => void
  existingImages?: string[]
}

export default function ImageUpload({
  maxImages = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  onImagesChange,
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Konverter eksisterende bilder til UploadedImage format
  const existingImageObjects: UploadedImage[] = existingImages.map((url, index) => ({
    id: `existing-${index}`,
    file: null as any, // Eksisterende bilder har ikke file
    url,
    name: `Eksisterende bilde ${index + 1}`,
    size: 0,
    uploaded: true
  }))

  const allImages = [...existingImageObjects, ...images]

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Ugyldig filtype. Tillatte typer: ${acceptedTypes.join(', ')}`
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Filen er for stor. Maks størrelse: ${maxFileSize}MB`
    }
    
    return null
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Beregn nye dimensjoner (maks 1920x1080)
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        
        // Tegn bildet
        ctx.drawImage(img, 0, 0, width, height)
        
        // Konverter til blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          0.85 // Kvalitet 85%
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'listings')
    
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Feil ved opplasting av bilde')
    }
    
    const result = await response.json()
    return result.url
  }

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (allImages.length + fileArray.length > maxImages) {
      toast.error(`Maksimalt ${maxImages} bilder tillatt`)
      return
    }
    
    setIsUploading(true)
    
    try {
      for (const file of fileArray) {
        const validationError = validateFile(file)
        if (validationError) {
          toast.error(validationError)
          continue
        }
        
        // Komprimér bildet
        const compressedFile = await compressImage(file)
        
        // Opprett preview
        const previewUrl = URL.createObjectURL(compressedFile)
        const imageId = Date.now() + Math.random().toString(36)
        
        const newImage: UploadedImage = {
          id: imageId,
          file: compressedFile,
          url: previewUrl,
          name: file.name,
          size: compressedFile.size,
          uploaded: false
        }
        
        setImages(prev => [...prev, newImage])
        
        try {
          // Last opp til server
          const uploadedUrl = await uploadImage(compressedFile)
          
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, url: uploadedUrl, uploaded: true }
              : img
          ))
          
          toast.success(`${file.name} lastet opp`)
        } catch (error) {
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, error: 'Opplasting feilet', uploaded: false }
              : img
          ))
          toast.error(`Feil ved opplasting av ${file.name}`)
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files)
    }
  }

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      onImagesChange(updated)
      return updated
    })
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const updated = [...prev]
      const [movedItem] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, movedItem)
      onImagesChange(updated)
      return updated
    })
  }

  // Oppdater parent når bilder endres
  React.useEffect(() => {
    onImagesChange(images)
  }, [images, onImagesChange])

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Last opp bilder
          </h3>
          <p className="text-gray-600 mb-4">
            Dra og slipp bilder her, eller klikk for å velge filer
          </p>
          <Button 
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || allImages.length >= maxImages}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Velg bilder
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="mt-3 text-xs text-gray-500">
            <p>Maks {maxImages} bilder • Maks {maxFileSize}MB per bilde</p>
            <p>Tillatte formater: JPEG, PNG, WebP</p>
          </div>
        </CardContent>
      </Card>

      {/* Bildegalleri */}
      {allImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">
              Bilder ({allImages.length}/{maxImages})
            </h4>
            {allImages.length > 0 && (
              <Badge variant="outline">
                Det første bildet blir hovedbilde
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <Card key={image.id} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Status overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => moveImage(index, index - 1)}
                          >
                            <Move className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      {image.uploaded ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Lastet opp
                        </Badge>
                      ) : image.error ? (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Feil
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                          Laster opp...
                        </Badge>
                      )}
                    </div>
                    
                    {/* Hovedbilde badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-500">
                          Hovedbilde
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600 truncate">
                    {image.name}
                  </div>
                  {image.size > 0 && (
                    <div className="text-xs text-gray-500">
                      {(image.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="text-center text-gray-600">
          <RotateCcw className="h-5 w-5 animate-spin mx-auto mb-2" />
          Laster opp bilder...
        </div>
      )}
    </div>
  )
}
