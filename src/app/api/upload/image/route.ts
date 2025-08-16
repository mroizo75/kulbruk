import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil ble sendt' },
        { status: 400 }
      )
    }

    // Valider filtype
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Ugyldig filtype. Tillatte typer: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Valider filstørrelse
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Filen er for stor. Maks størrelse: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Konverter fil til buffer for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generer unikt filnavn for Cloudinary
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${fileExtension}`
    
    try {
      // Last opp til Cloudinary
      const uploadResult = await uploadToCloudinary(buffer, {
        folder,
        filename: fileName.split('.')[0], // Cloudinary bruker ikke extension i filename
        width: 1200,
        height: 800,
        quality: 'auto'
      })

      console.log(`📸 Bilde lastet opp til Cloudinary: ${uploadResult.secureUrl} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

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
          // Generer thumbnail URLs
          thumbnail: uploadResult.secureUrl.replace('/upload/', '/upload/w_300,h_200,c_fill,q_auto,f_auto/'),
          medium: uploadResult.secureUrl.replace('/upload/', '/upload/w_600,h_400,c_fill,q_auto,f_auto/'),
          large: uploadResult.secureUrl
        }
      })
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError)
      throw new Error('Failed to upload to Cloudinary')
    }

  } catch (error) {
    console.error('Feil ved bildeopplasting:', error)
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
