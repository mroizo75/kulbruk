import { ServerClient } from 'postmark'

type SendEmailParams = {
  to: string
  subject: string
  html?: string
  text?: string
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

function getPostmarkClient() {
  const apiKey = process.env.POSTMARK_API_KEY
  if (!apiKey) throw new Error('POSTMARK_API_KEY mangler')
  return new ServerClient(apiKey)
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const client = getPostmarkClient()
  const from = process.env.POSTMARK_FROM || 'info@kksas.no'
  const messageStream = process.env.POSTMARK_STREAM || 'outbound'
  return client.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    MessageStream: messageStream,
  })
}

// Templates
export function listingApprovedTemplate(params: { title: string; listingId: string; shortCode?: string }) {
  const url = `${getBaseUrl()}/annonser/detaljer/${params.listingId}`
  return {
    subject: 'Annonsen din er godkjent på Kulbruk',
    html: `<p>Hei!</p>
<p>Annonsen "${params.title}" er nå godkjent og publisert.</p>
<p>Annonsenr: <strong>${params.shortCode || params.listingId}</strong></p>
<p>Se annonsen: <a href="${url}">${url}</a></p>
<p>Hilsen Kulbruk</p>`,
  }
}

export function listingRejectedTemplate(params: { title: string }) {
  return {
    subject: 'Annonsen ble dessverre avvist',
    html: `<p>Hei!</p>
<p>Annonsen "${params.title}" ble avvist. Vennligst gjennomgå retningslinjene og prøv igjen.</p>
<p>Hilsen Kulbruk</p>`,
  }
}

export function newMessageTemplate(params: { listingTitle: string; conversationUrl: string }) {
  return {
    subject: 'Ny melding på annonsen din',
    html: `<p>Hei!</p>
<p>Du har mottatt en ny melding om "${params.listingTitle}".</p>
<p>Åpne samtalen: <a href="${params.conversationUrl}">${params.conversationUrl}</a></p>
<p>Hilsen Kulbruk</p>`,
  }
}

export function reportReceivedTemplate(params: { listingTitle: string; reason: string; comment?: string }) {
  return {
    subject: 'Ny rapport mottatt',
    html: `<p>Ny rapport på annonsen "${params.listingTitle}"</p>
<p>Årsak: <strong>${params.reason}</strong></p>
${params.comment ? `<p>Kommentar: ${params.comment}</p>` : ''}
`,
  }
}

export function listingExpiringTemplate(params: { title: string; listingId: string; daysLeft: number }) {
  const url = `${getBaseUrl()}/annonser/detaljer/${params.listingId}`
  return {
    subject: `Annonsen utløper om ${params.daysLeft} dager`,
    html: `<p>Hei!</p>
<p>Annonsen "${params.title}" utløper om ${params.daysLeft} dager.</p>
<p>Se annonsen: <a href="${url}">${url}</a></p>
<p>Hilsen Kulbruk</p>`,
  }
}

export function savedSearchDigestTemplate(params: { searchName?: string | null; items: Array<{ title: string; url: string; price?: number | null; location?: string | null }> ; periodLabel: string }) {
  const list = params.items.map((i) => {
    const price = typeof i.price === 'number' ? `${new Intl.NumberFormat('nb-NO').format(i.price)} kr` : ''
    const loc = i.location ? ` – ${i.location}` : ''
    return `<li><a href="${i.url}">${i.title}</a> ${price}${loc}</li>`
  }).join('')
  const name = params.searchName || 'Lagret søk'
  return {
    subject: `Nye treff for "${name}" (${params.periodLabel})`,
    html: `<p>Hei!</p>
<p>Her er nye annonser som matcher søket "${name}" fra siste ${params.periodLabel.toLowerCase()}:</p>
<ul>${list}</ul>
<p>Hilsen Kulbruk</p>`,
  }
}


