'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface ContactSellerProps {
	listingId: string
	sellerId: string
}

export default function ContactSeller({ listingId, sellerId }: ContactSellerProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSend() {
        if (!message || message.trim().length === 0) {
            toast.error('Skriv en melding før du sender')
            return
        }
        try {
            setLoading(true)
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId, toUserId: sellerId, content: message.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Kunne ikke sende melding')
            toast.success('Melding sendt til selger')
            setOpen(false)
            setMessage('')
        } catch (e: any) {
            toast.error(e?.message || 'Noe gikk galt')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    Send melding
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Skriv en melding til selger</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <Textarea
                        placeholder="Hei! Jeg er interessert i annonsen. Når passer det å ta en prat?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Avbryt</Button>
                        <Button onClick={handleSend} disabled={loading}>{loading ? 'Sender…' : 'Send'}</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

