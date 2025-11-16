import * as React from 'react'

interface HotelBookingConfirmationEmailProps {
  guestName: string
  hotelName: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  rooms: number
  totalPrice: string
  currency: string
  confirmationCode: string
  bookingId: string
}

export const HotelBookingConfirmationEmail = ({
  guestName,
  hotelName,
  checkIn,
  checkOut,
  adults,
  children,
  rooms,
  totalPrice,
  currency,
  confirmationCode,
  bookingId
}: HotelBookingConfirmationEmailProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nb-NO', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#16a34a', color: 'white', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Booking bekreftet! 🎉</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px' }}>
          Takk for din hotellbooking hos Kulbruk.no
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '30px', backgroundColor: '#f9fafb' }}>
        {/* Confirmation Code */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #16a34a' }}>
          <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>
            Bekreftelseskode
          </p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {confirmationCode}
          </p>
        </div>

        {/* Guest Info */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#111827' }}>
            Hei {guestName}! 👋
          </h2>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>
            Din hotellbooking er bekreftet. Du vil motta en e-post fra hotellet med flere detaljer kort tid.
          </p>
        </div>

        {/* Hotel Details */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#111827' }}>
            📍 Hotelldetaljer
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b7280' }}>Hotell:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#111827' }}>{hotelName}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b7280' }}>Innsjekk:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#111827' }}>{formatDate(checkIn)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b7280' }}>Utsjekk:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#111827' }}>{formatDate(checkOut)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b7280' }}>Gjester:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#111827' }}>
                  {adults} voksne{children > 0 ? `, ${children} barn` : ''}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b7280' }}>Rom:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#111827' }}>{rooms}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Price */}
        <div style={{ backgroundColor: '#16a34a', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px' }}>Totalt betalt:</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {totalPrice} {currency}
            </span>
          </div>
        </div>

        {/* Important Info */}
        <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fbbf24' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#92400e' }}>
            ⚠️ Viktig informasjon
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
            <li>Ta med bekreftelseskoden når du sjekker inn</li>
            <li>Sjekk hotellets kanselleringsregler</li>
            <li>Kontakt hotellet direkte for spesielle ønsker</li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <a 
            href={`https://kulbruk.no/dashboard/customer/hotellbookinger`}
            style={{
              display: 'inline-block',
              backgroundColor: '#16a34a',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
          >
            Se booking
          </a>
          <a 
            href={`https://kulbruk.no/hotell`}
            style={{
              display: 'inline-block',
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Book flere hoteller
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: '#111827', color: '#9ca3af', padding: '20px', textAlign: 'center', fontSize: '14px' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Booking ID: {bookingId}
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          Har du spørsmål? Kontakt oss på <a href="mailto:support@kulbruk.no" style={{ color: '#16a34a' }}>support@kulbruk.no</a>
        </p>
        <p style={{ margin: 0 }}>
          © 2025 Kulbruk.no - Din pålitelige reisepartner
        </p>
      </div>
    </div>
  )
}

