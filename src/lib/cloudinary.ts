import { v2 as cloudinary } from 'cloudinary'

// Konfigurer Cloudinary
// Cloudinary kan konfigureres med enten CLOUDINARY_URL eller individuelle variabler
if (process.env.CLOUDINARY_URL) {
  // Automatisk parsing av CLOUDINARY_URL
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  // Manuell konfigurering med individuelle variabler
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Sjekk om Cloudinary er konfigurert
export function isCloudinaryConfigured(): boolean {
  // Sjekk enten CLOUDINARY_URL eller individuelle variabler
  return !!(
    process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && 
     process.env.CLOUDINARY_API_KEY && 
     process.env.CLOUDINARY_API_SECRET)
  )
}

/**
 * Last opp bilde til Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string
    filename?: string
    width?: number
    height?: number
    quality?: string | number
  } = {}
): Promise<{
  url: string
  secureUrl: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}> {
  const {
    folder = 'kulbruk/listings',
    filename,
    width = 1200,
    height = 800,
    quality = 'auto'
  } = options

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        transformation: [
          {
            width,
            height,
            crop: 'fill',
            quality,
            format: 'auto', // Automatisk WebP/AVIF
            fetch_format: 'auto'
          }
        ],
        // Generer flere varianter automatisk
        eager: [
          {
            width: 300,
            height: 200,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          },
          {
            width: 600,
            height: 400,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(error)
        } else if (result) {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          })
        } else {
          reject(new Error('No result from Cloudinary'))
        }
      }
    ).end(buffer)
  })
}

/**
 * Generer optimaliserte URL-er for forskjellige størrelser
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    crop?: string
    format?: string
  } = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    crop = 'fill',
    format = 'auto'
  } = options

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    fetch_format: 'auto'
  })
}

/**
 * Slett bilde fra Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw error
  }
}

export default cloudinary
