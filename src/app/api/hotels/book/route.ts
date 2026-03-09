import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { resend } from '@/lib/resend'
import { HotelBookingConfirmationEmail } from '@/lib/email-templates/hotel-booking-confirmation'
import { render } from '@react-email/render'
import { getSupportSessionId, logHotelRequest } from '@/lib/support-session-logger'

const { logger } = Sentry

export async function POST(request: NextRequest) {
  const start = Date.now()
  const supportSessionId = getSupportSessionId(request)

  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/hotels/book',
    },
    async (span) => {
      try {
        logger.info('📦 API: Book hotel request received')

        let session = await getServerSession(authOptions)
        const body = await request.json()
        const { partnerOrderId, bookHash, childAges, guestInfo, paymentType, paymentIntentId, remarks } = body

        span.setAttribute('partnerOrderId', partnerOrderId)
        span.setAttribute('guestEmail', guestInfo?.email || 'unknown')
        span.setAttribute('paymentType', paymentType?.type || 'unknown')

        logger.debug(logger.fmt`Booking request for partnerOrderId: ${partnerOrderId}`)

    if (!partnerOrderId || !guestInfo || !paymentType) {
      const errRes = { success: false, error: 'Missing required parameters: partnerOrderId, guestInfo, paymentType' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/book',
          method: 'POST',
          requestBody: body,
          responseStatus: 400,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 400 })
    }

    // Validate guest info
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      const errRes = { success: false, error: 'Missing guest information' }
      if (supportSessionId) {
        void logHotelRequest({
          supportSessionId,
          path: '/api/hotels/book',
          method: 'POST',
          requestBody: body,
          responseStatus: 400,
          responseBody: errRes,
          durationMs: Date.now() - start,
        })
      }
      return NextResponse.json(errRes, { status: 400 })
    }

    // Automatisk kontoopprettelse hvis ikke innlogget
    let userId = session?.user?.id
    if (!userId) {
      console.log('👤 Creating guest account for:', guestInfo.email)
      
      // Sjekk om bruker allerede eksisterer
      const existingUser = await prisma.user.findUnique({
        where: { email: guestInfo.email }
      })

      if (existingUser) {
        userId = existingUser.id
        console.log('👤 Found existing user:', userId)
      } else {
        // Opprett ny bruker
        const bcrypt = await import('bcryptjs')
        const tempPassword = Math.random().toString(36).substring(7)
        const passwordHash = await bcrypt.hash(tempPassword, 10)

        const newUser = await prisma.user.create({
          data: {
            email: guestInfo.email,
            name: `${guestInfo.firstName} ${guestInfo.lastName}`,
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            phone: guestInfo.phone,
            passwordHash: passwordHash,
            role: 'customer',
            emailVerified: new Date() // Auto-verifiser for bookinger
          }
        })

        userId = newUser.id
        console.log('✅ Created new user:', userId)

        // TODO: Send velkomst-epost med mulighet til å sette passord
      }
    }

        // Call RateHawk finish booking
        const bookingResult = await Sentry.startSpan(
          {
            op: 'http.client',
            name: 'RateHawk finishBooking',
          },
          async (bookingSpan) => {
            bookingSpan.setAttribute('partnerOrderId', partnerOrderId)
            bookingSpan.setAttribute('paymentType', paymentType.type)
            return await ratehawkClient.finishBooking({
              bookHash: bookHash || '',
              partnerOrderId,
              userEmail: guestInfo.email,
              userPhone: guestInfo.phone,
              firstName: guestInfo.firstName,
              lastName: guestInfo.lastName,
              childAges: Array.isArray(childAges) ? childAges : [],
              paymentType: paymentType.type,
              amount: paymentType.amount,
              currencyCode: paymentType.currency_code,
              remarks: remarks || ''
            })
          }
        )

        // Finale feil fra finishBooking stopper prosessen umiddelbart
        if (!bookingResult.success && (bookingResult as any).isFinal) {
          const errorCode = (bookingResult as any).error
          const userMessage =
            errorCode === 'booking_form_expired'
              ? 'Bookingsesjonen er utløpt. Vennligst start på nytt.'
              : errorCode === 'rate_not_found'
              ? 'Rommet er ikke lenger tilgjengelig.'
              : 'En feil oppsto. Vennligst kontakt support.'
          logger.error('Final booking error from finishBooking', { partnerOrderId, errorCode })
          span.setAttribute('bookingSuccess', false)
          const errRes = { success: false, error: userMessage }
          if (supportSessionId) {
            void logHotelRequest({
              supportSessionId,
              path: '/api/hotels/book',
              method: 'POST',
              requestBody: body,
              responseStatus: 500,
              responseBody: errRes,
              durationMs: Date.now() - start,
            })
          }
          return NextResponse.json(errRes, { status: 500 })
        }

        span.setAttribute('bookingSuccess', true)
        span.setAttribute('orderId', bookingResult.data?.order_id ?? 0)

        // Finale feil fra /finish/status/ som stopper polling
        const FINAL_STATUS_ERRORS = ['block', 'charge', '3ds', 'soldout', 'provider', 'book_limit', 'not_allowed', 'booking_finish_did_not_succeed']

        // Poll /finish/status/ hvert 5. sek, maks 180 sek (36 forsøk)
        let statusCheckAttempts = 0
        const maxAttempts = 36
        let finalStatus: any = null

        while (statusCheckAttempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, statusCheckAttempts === 0 ? 2000 : 5000))

          const statusResult = await Sentry.startSpan(
            {
              op: 'http.client',
              name: `RateHawk checkBookingStatus (attempt ${statusCheckAttempts + 1})`,
            },
            async () => {
              return await ratehawkClient.checkBookingStatus(partnerOrderId)
            }
          )

          logger.debug(logger.fmt`Status check attempt ${statusCheckAttempts + 1}: ${statusResult.status}`)

          if (statusResult.status === 'ok') {
            finalStatus = { status: 'confirmed', ...statusResult }
            break
          } else if (statusResult.error === '3ds' || statusResult.status === '3ds') {
            finalStatus = { status: '3ds_required', ...statusResult }
            break
          } else if (statusResult.status === 'error' && FINAL_STATUS_ERRORS.includes(statusResult.error || '')) {
            // Final feil – stopp polling og gi generell brukermelding
            finalStatus = {
              status: 'failed',
              error: 'En feil oppsto. Vennligst kontakt support.',
              ...statusResult
            }
            break
          }
          // Ikke-finale feil (timeout, unknown, 5xx, processing): fortsett polling

          statusCheckAttempts++
        }

        if (!finalStatus) {
          logger.warn('Booking status check timeout', { partnerOrderId, attempts: statusCheckAttempts })
          finalStatus = { status: 'timeout', error: 'Booking status check timeout' }
        }

        span.setAttribute('finalStatus', finalStatus.status)
        span.setAttribute('statusCheckAttempts', statusCheckAttempts)

        // HCN hentes ikke her – /order/info/ brukes kun som historikk og kan ta opptil 1 minutt
        const hcn: string | null = null

        // Lagre booking i database (nå har vi alltid en userId)
        if (userId) {
          await Sentry.startSpan(
            {
              op: 'db.query',
              name: 'Create hotel booking',
            },
            async (dbSpan) => {
              // I sandbox kan order_id være 0, bruk partner_order_id som unik ID
              const uniqueBookingId = bookingResult.data.order_id > 0 
                ? bookingResult.data.order_id.toString() 
                : `sandbox_${partnerOrderId}`

              dbSpan.setAttribute('bookingId', uniqueBookingId)
              dbSpan.setAttribute('userId', userId)

              await prisma.hotelBooking.create({
                data: {
                  userId: userId,
                  bookingId: uniqueBookingId,
                  confirmationCode: partnerOrderId,
                  hcn: hcn, // Hotel Confirmation Number
                  paymentIntentId: paymentIntentId || null,
                  guestFirstName: guestInfo.firstName,
                  guestLastName: guestInfo.lastName,
                  guestEmail: guestInfo.email,
                  guestPhone: guestInfo.phone,
                  status: finalStatus.status,
                  matchHash: partnerOrderId
                }
              })
            }
          )
        }

        logger.info('Hotel booking created', {
          partnerOrderId,
          status: finalStatus.status,
          hcn: hcn || 'none'
        })

        // RateHawk returnerer 'ok' for vellykket booking i sandbox
        const isSuccess = finalStatus.status === 'ok' || finalStatus.status === 'confirmed'

        // Send vår egen bekreftelse-epost til gjesten (RateHawk sender til corporate email)
        if (isSuccess && userId && paymentType) {
          try {
            await Sentry.startSpan(
              {
                op: 'email.send',
                name: 'Send booking confirmation email',
              },
              async (emailSpan) => {
                emailSpan.setAttribute('to', guestInfo.email)
                emailSpan.setAttribute('partnerOrderId', partnerOrderId)

                const emailHtml = render(
                  HotelBookingConfirmationEmail({
                    guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
                    hotelName: body.hotelName || 'Hotellbooking',
                    checkIn: body.checkIn || new Date().toISOString(),
                    checkOut: body.checkOut || new Date().toISOString(),
                    adults: body.adults || 2,
                    children: Array.isArray(childAges) ? childAges.length : 0,
                    rooms: body.rooms || 1,
                    totalPrice: paymentType.amount || '0',
                    currency: paymentType.currency_code || 'NOK',
                    confirmationCode: partnerOrderId,
                    bookingId: bookingResult.data?.order_id?.toString() || partnerOrderId
                  })
                )

                await resend.emails.send({
                  from: 'Kulbruk.no <bookings@kulbruk.no>',
                  to: guestInfo.email,
                  subject: `Hotellbooking bekreftet - ${partnerOrderId}`,
                  html: emailHtml
                })

                logger.info('Booking confirmation email sent', {
                  email: guestInfo.email,
                  partnerOrderId
                })
              }
            )
          } catch (emailError) {
            logger.error('Failed to send booking confirmation email', {
              email: guestInfo.email,
              partnerOrderId,
              error: emailError instanceof Error ? emailError.message : String(emailError)
            })
            Sentry.captureException(emailError)
          }
        }

        const resBody = {
          success: isSuccess,
          booking: {
            orderId: bookingResult.data.order_id,
            partnerOrderId: bookingResult.data.partner_order_id,
            status: finalStatus.status,
            itemId: bookingResult.data.item_id,
            requires3DS: finalStatus.status === '3ds_required',
            data3DS: finalStatus.data?.data_3ds,
            error: finalStatus.error
          }
        }
        if (supportSessionId) {
          void logHotelRequest({
            supportSessionId,
            path: '/api/hotels/book',
            method: 'POST',
            requestBody: body,
            responseStatus: 200,
            responseBody: resBody,
            durationMs: Date.now() - start,
          })
        }
        return NextResponse.json(resBody)
      } catch (error: unknown) {
        const err = error as { message?: string }
        logger.error('Booking error', {
          partnerOrderId: (error as any)?.partnerOrderId,
          error: err.message || String(error)
        })
        Sentry.captureException(error)
        span.setAttribute('error', err.message || String(error))
        const errRes = { success: false, error: err.message || 'Failed to create booking', details: err.message }
        if (supportSessionId) {
          void logHotelRequest({
            supportSessionId,
            path: '/api/hotels/book',
            method: 'POST',
            requestBody: null,
            responseStatus: 500,
            responseBody: errRes,
            durationMs: Date.now() - start,
          })
        }
        return NextResponse.json(errRes, { status: 500 })
      }
    }
  )
}

