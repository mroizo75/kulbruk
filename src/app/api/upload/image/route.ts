import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
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

    // Opprett upload mappe hvis den ikke eksisterer
    const uploadPath = path.join(UPLOAD_DIR, folder)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // Generer unikt filnavn
    const fileExtension = path.extname(file.name)
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadPath, fileName)

    // Konverter fil til buffer og lagre
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generer URL for tilgang til filen
    const fileUrl = `/uploads/${folder}/${fileName}`

    console.log(`📸 Bilde lastet opp: ${fileUrl} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    })

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
