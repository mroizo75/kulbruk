import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import { applyRateLimit } from '@/lib/rate-limit'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_MIME_SIGNATURES = {
  'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47])],
  'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])],
}

function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signatures = ALLOWED_MIME_SIGNATURES[mimeType as keyof typeof ALLOWED_MIME_SIGNATURES]
  if (!signatures) return false
  
  return signatures.some(sig => buffer.subarray(0, sig.length).equals(sig))
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const rateLimitResult = await applyRateLimit(request, 20, 60000)
    if (rateLimitResult) return rateLimitResult

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || 'general'

    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50)

    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil ble sendt' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Ugyldig filtype. Tillatte typer: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Filen er for stor. Maks størrelse: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: 'Filinnholdet samsvarer ikke med filtypen' },
        { status: 400 }
      )
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Ugyldig filendelse' },
        { status: 400 }
      )
    }
    
    const fileName = `${uuidv4()}.${fileExtension}`
    
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadToCloudinary(buffer, {
          folder: sanitizedFolder,
          filename: fileName.split('.')[0],
          width: 1200,
          height: 800,
          quality: 'auto'
        })

        return NextResponse.json({
          success: true,
          url: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          filename: fileName,
          size: file.size,
          type: file.type,
          width: uploadResult.width,
          height: uploadResult.height,
          cloudinary: {
            thumbnail: uploadResult.secureUrl.replace('/upload/', '/upload/w_300,h_200,c_fill,q_auto,f_auto/'),
            medium: uploadResult.secureUrl.replace('/upload/', '/upload/w_600,h_400,c_fill,q_auto,f_auto/'),
            large: uploadResult.secureUrl
          }
        })
      } catch (cloudinaryError) {
        return NextResponse.json(
          { error: 'Bildeopplasting feilet' },
          { status: 500 }
        )
      }
    }
    
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: fileName,
      size: file.size,
      type: file.type,
      fallback: 'base64'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Intern server feil ved bildeopplasting' },
      { status: 500 }
    )
  }
}

// Håndter GET for å liste bilder (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'general'
    
    return NextResponse.json({
      message: 'Bildeopplasting API er aktiv',
      supportedTypes: ALLOWED_TYPES,
      maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
      folder
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Feil ved henting av bildeinformasjon' },
      { status: 500 }
    )
  }
}
