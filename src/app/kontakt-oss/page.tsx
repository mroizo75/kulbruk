'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  Building2,
  User,
  HelpCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementer faktisk sending av skjema
    setIsSubmitted(true)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "E-post",
      info: "hjelp@kulbruk.no",
      description: "Send oss en e-post, vi svarer innen 24 timer",
      available: "24/7"
    },
    {
      icon: Phone,
      title: "Telefon",
      info: "+47 XX XX XX XX",
      description: "Ring oss for direkte hjelp",
      available: "Mandag-Fredag 9:00-15:00"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      info: "Chat med oss",
      description: "Få hjelp i sanntid fra vårt supportteam",
      available: "Mandag-Fredag 8:00-16:00"
    },
    {
      icon: MapPin,
      title: "Adresse",
      info: "Buskerud, Norge",
      description: "Vårt hovedkontor",
      available: "Mandag-Fredag 9:00-16:00"
    }
  ]

  const categories = [
    { value: 'technical', label: 'Teknisk støtte' },
    { value: 'billing', label: 'Fakturering og betaling' },
    { value: 'account', label: 'Brukerkonto' },
    { value: 'listing', label: 'Annonser og salg' },
    { value: 'business', label: 'Bedrift og auksjoner' },
    { value: 'other', label: 'Annet' }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto text-center border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#af4c0f]/10">
                <CheckCircle className="h-8 w-8 text-[#af4c0f]" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Takk for din henvendelse!</CardTitle>
              <CardDescription className="text-lg">
                Vi har mottatt din melding og vil svare deg innen 24 timer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white"
              >
                Send ny melding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10">
              <MessageCircle className="h-6 w-6 text-[#af4c0f]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kontakt oss</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vi er her for å hjelpe deg! Ta kontakt med vårt supportteam eller send oss en melding.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontaktinformasjon</h2>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="border-2 hover:border-[#af4c0f]/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#af4c0f]/10 flex-shrink-0">
                        <method.icon className="h-6 w-6 text-[#af4c0f]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                        <p className="text-[#af4c0f] font-medium mb-2">{method.info}</p>
                        <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {method.available}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Business Hours */}
            <Card className="mt-6 border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#af4c0f]" />
                  Åpningstider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mandag - Fredag:</span>
                    <span className="font-medium">9:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lørdag:</span>
                    <span className="font-medium">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Søndag:</span>
                    <span className="font-medium">Stengt</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send oss en melding</h2>
            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Navn *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-post *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Velg en kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Emne *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="Skriv en kort beskrivelse av ditt problem"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Melding *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      className="mt-1 min-h-[120px]"
                      placeholder="Beskriv ditt problem eller spørsmål i detalj..."
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Vi svarer vanligvis innen 24 timer på hverdager.</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#af4c0f] hover:bg-[#af4c0f]/90 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send melding
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="text-center border-2 border-[#af4c0f]/20 bg-[#af4c0f]/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sjekk våre ofte stilte spørsmål</h3>
              <p className="text-gray-600 mb-4">
                Kanskje finner du svaret på ditt spørsmål i vår omfattende FAQ-seksjon.
              </p>
              <Button asChild variant="outline" className="border-[#af4c0f] text-[#af4c0f] hover:bg-[#af4c0f]/10">
                <a href="/hjelp-og-stotte">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Gå til hjelp og støtte
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
