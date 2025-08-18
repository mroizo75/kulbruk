import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function GET() {
  try {
    console.log('🧪 Testing Resend configuration...')
    console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY)
    console.log('🔑 API Key (first 10 chars):', process.env.RESEND_API_KEY?.substring(0, 10))
    
    const result = await resend.emails.send({
      from: 'Kulbruk.no <bookings@kulbruk.no>',
      to: 'kenneth@kksas.no',
      subject: '🧪 Test Email fra Kulbruk.no',
      html: `
        <h1>Test Email</h1>
        <p>Dette er en test-epost fra Kulbruk.no for å verifisere Resend-integrasjonen.</p>
        <p>Sendt: ${new Date().toLocaleString('nb-NO')}</p>
      `,
      text: `
Test Email fra Kulbruk.no

Dette er en test-epost for å verifisere Resend-integrasjonen.
Sendt: ${new Date().toLocaleString('nb-NO')}
      `
    })
    
    console.log('✅ Test email sent!')
    console.log('📧 Result:', JSON.stringify(result, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result: result
    })
    
  } catch (error) {
    console.error('❌ Test email failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: JSON.stringify(error, null, 2)
    }, { status: 500 })
  }
}
