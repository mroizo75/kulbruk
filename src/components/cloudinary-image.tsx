'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getCloudinaryUrl } from '@/lib/cloudinary'

interface CloudinaryImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  quality?: number | string
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimalisert bildekomponent for Cloudinary
 * Automatisk optimalisering og responsive bilder
 */
export default function CloudinaryImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  sizes,
  priority = false,
  fill = false,
  quality = 'auto',
  placeholder = 'empty',
  onLoad,
  onError
}: CloudinaryImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Sjekk om det er en Cloudinary URL
  const isCloudinaryUrl = src.includes('cloudinary.com') || src.includes('res.cloudinary.com')
  
  // Hvis det er en Cloudinary public_id, generer optimalisert URL
  let optimizedSrc = src
  if (isCloudinaryUrl) {
    // Hvis det allerede er en Cloudinary URL, bruk den direkte
    optimizedSrc = src
  } else if (src.startsWith('data:')) {
    // Base64 data URL - bruk direkte
    optimizedSrc = src
  } else if (src.startsWith('/uploads/')) {
    // Gamle lokale bilder - bruk direkte
    optimizedSrc = src
  } else {
    // Behandle som Cloudinary public_id
    optimizedSrc = getCloudinaryUrl(src, {
      width,
      height,
      quality,
      crop: 'fill'
    })
  }

  const handleLoad = () => {
    setImageLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setImageError(true)
    onError?.()
  }

  // Fallback hvis bilde ikke kan lastes
  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span className="text-gray-500 text-sm">Bilde ikke tilgjengelig</span>
      </div>
    )
  }

  return (
    <div className={`relative ${!imageLoaded ? 'animate-pulse bg-gray-200' : ''}`}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}
