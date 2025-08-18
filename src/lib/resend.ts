import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates og utility functions
export interface BookingConfirmationData {
  to: string
  booking: {
    id: string
    confirmationCode: string
    totalPrice: number
    currency: string
    route: string
    departureDate: Date
    returnDate?: Date
    status: string
  }
  travelers: Array<{
    name: { firstName: string; lastName: string }
    dateOfBirth: string
    gender: string
  }>
  flightDetails: any
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData) {
  try {
    console.log('📧 Starting email send process...')
    console.log('📧 Resend API Key present:', !!process.env.RESEND_API_KEY)
    console.log('📧 Sending booking confirmation email to:', data.to)
    console.log('📧 Booking data:', JSON.stringify(data.booking, null, 2))
    console.log('📧 Departure date type:', typeof data.booking.departureDate)
    console.log('📧 Departure date value:', data.booking.departureDate)
    
    const { booking, travelers, flightDetails } = data
    
    // Ensure dates are proper Date objects
    const departureDate = new Date(booking.departureDate)
    const returnDate = booking.returnDate ? new Date(booking.returnDate) : null
    
    console.log('📧 Processed departure date:', departureDate)
    console.log('📧 Processed return date:', returnDate)
    console.log('📧 Is departure date valid:', !isNaN(departureDate.getTime()))
    
    // Fallback hvis dato er invalid
    const safeDepartureDate = !isNaN(departureDate.getTime()) ? departureDate : new Date()
    const safeReturnDate = returnDate && !isNaN(returnDate.getTime()) ? returnDate : null
    
    // Format travelers list
    const travelersList = travelers.map((t, index) => 
      `${index + 1}. ${t.name.firstName} ${t.name.lastName} (${t.dateOfBirth})`
    ).join('\n')
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation - Kulbruk.no</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
            .booking-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .flight-details { background: #dbeafe; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .important { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin: 15px 0; }
            .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .label { font-weight: bold; width: 40%; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>✈️ Flyreise Booket!</h1>
              <p>Takk for at du valgte Kulbruk.no</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <h2>Hei ${travelers[0]?.name.firstName || 'Reisende'}! 👋</h2>
              <p>Din flyreise er nå bekreftet og booket. Her er alle detaljene du trenger:</p>
              
              <!-- Booking Info -->
              <div class="booking-info">
                <h3>📋 Booking Informasjon</h3>
                <table>
                  <tr><td class="label">Booking ID:</td><td>${booking.id}</td></tr>
                  <tr><td class="label">PNR-kode:</td><td><strong>${booking.confirmationCode}</strong></td></tr>
                  <tr><td class="label">Rute:</td><td>${booking.route}</td></tr>
                  <tr><td class="label">Totalpris:</td><td><strong>${booking.totalPrice.toLocaleString('nb-NO')} ${booking.currency}</strong></td></tr>
                  <tr><td class="label">Status:</td><td>${booking.status}</td></tr>
                </table>
              </div>
              
              <!-- Flight Details -->
              <div class="flight-details">
                <h3>✈️ Flydetaljer</h3>
                <table>
                  <tr><td class="label">Avreise:</td><td>${safeDepartureDate.toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                  ${safeReturnDate ? `<tr><td class="label">Retur:</td><td>${safeReturnDate.toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>` : ''}
                </table>
              </div>
              
              <!-- Passengers -->
              <div class="booking-info">
                <h3>👥 Passasjerer (${travelers.length})</h3>
                <pre style="white-space: pre-line; margin: 10px 0;">${travelersList}</pre>
              </div>
              
              <!-- Important Info -->
              <div class="important">
                <h4>⚠️ Viktig å huske:</h4>
                <ul>
                  <li><strong>Check-in:</strong> Online check-in åpner 24 timer før avgang</li>
                  <li><strong>Dokument:</strong> Husk gyldig pass/ID til flyplassen</li>
                  <li><strong>Bagasje:</strong> Kun håndbagasje inkludert - kjøp ekstra bagasje om nødvendig</li>
                  <li><strong>PNR-kode:</strong> Bruk <strong>${booking.confirmationCode}</strong> for check-in og på flyselskaps nettsider</li>
                </ul>
              </div>
              
              <!-- App Download -->
              <div style="text-align: center; margin: 20px 0;">
                <h4>📱 Last ned Amadeus Travel App for best opplevelse:</h4>
                <a href="https://play.google.com/store/apps/details?id=com.amadeus.travel" class="button">Google Play</a>
                <a href="https://apps.apple.com/app/amadeus-travel/id123456789" class="button">App Store</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p><strong>Kulbruk.no</strong> - Norges smarteste reiseplattform</p>
              <p>Har du spørsmål? Kontakt oss på <a href="mailto:support@kulbruk.no" style="color: #93c5fd;">support@kulbruk.no</a></p>
            </div>
          </div>
        </body>
      </html>
    `
    
    console.log('📧 About to call resend.emails.send...')
    console.log('📧 Email payload:', {
      from: 'Kulbruk.no <bookings@kulbruk.no>',
      to: data.to,
      subject: `✈️ Flyreise bekreftet - ${booking.route} (${booking.confirmationCode})`
    })

    const result = await resend.emails.send({
      from: 'Kulbruk.no <bookings@kulbruk.no>',
      to: data.to,
      subject: `✈️ Flyreise bekreftet - ${booking.route} (${booking.confirmationCode})`,
      html: emailHtml,
      text: `
Hei ${travelers[0]?.name.firstName || 'Reisende'}!

Din flyreise er bekreftet og booket:

Booking ID: ${booking.id}
PNR-kode: ${booking.confirmationCode}
Rute: ${booking.route}
Totalpris: ${booking.totalPrice.toLocaleString('nb-NO')} ${booking.currency}

Passasjerer:
${travelersList}

Viktig å huske:
- Check-in åpner 24 timer før avgang
- Bruk PNR-kode ${booking.confirmationCode} for check-in
- Husk gyldig pass/ID til flyplassen

Takk for at du valgte Kulbruk.no!

Med vennlig hilsen,
Kulbruk.no teamet
      `
    })
    
    console.log('✅ Email sent successfully!')
    console.log('📧 Resend response:', JSON.stringify(result, null, 2))
    return { success: true, data: result.data }
    
  } catch (error) {
    console.error('❌ Email sending failed - Full error:', error)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    return { success: false, error: error }
  }
}

export interface BookingSMSData {
  to: string
  confirmationCode: string
  route: string
  departureDate: Date
}

// Note: For SMS you would need a service like Twilio
// This is a placeholder for SMS functionality
export async function sendBookingSMS(data: BookingSMSData) {
  try {
    // TODO: Implement SMS service (Twilio, etc.)
    console.log('📱 SMS would be sent to:', data.to)
    console.log('Message: Flyreise booket! PNR:', data.confirmationCode, 'Rute:', data.route)
    
    return { success: true, message: 'SMS sending not implemented yet' }
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    return { success: false, error: error }
  }
}
