'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/image-upload'

interface ImageUploadStepProps {
  initialImages: string[]
  onComplete: (images: string[]) => void
}

export default function ImageUploadStep({ initialImages, onComplete }: ImageUploadStepProps) {
  const [uploadedImages, setUploadedImages] = useState(initialImages)

  const handleImageUpload = (images: any[]) => {
    const imageUrls = images.map(img => img.url || img)
    setUploadedImages(imageUrls)
  }

  const handleContinue = () => {
    onComplete(uploadedImages)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Legg til bilder
        </h1>
        <p className="text-gray-600">
          Gode bilder øker sjansen for salg betydelig
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last opp bilder</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            maxImages={10}
            onImagesChange={handleImageUpload}
            initialImages={uploadedImages}
          />
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tips for gode bilder:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ta bilder i godt lys, helst dagslys</li>
              <li>• Vis varen fra flere vinkler</li>
              <li>• Inkluder nærbilde av merkelapper og eventuelle skader</li>
              <li>• Unngå uryddig bakgrunn</li>
              <li>• Første bilde blir hovedbilde - gjør det attraktivt!</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <div></div>
        <Button onClick={handleContinue} size="lg">
          {uploadedImages.length > 0 ? 'Fortsett' : 'Hopp over bilder'}
        </Button>
      </div>
    </div>
  )
}
