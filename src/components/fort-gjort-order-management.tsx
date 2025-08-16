'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, Package, Truck, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Order {
  id: string
  status: string
  itemPrice: number
  kulbrukFee: number
  totalAmount: number
  sellerPayout: number
  deliveryDeadline: string | null
  approvalDeadline: string | null
  approvedAt: string | null
  completedAt: string | null
  paidAt: string | null
  shippedAt: string | null
  listing: {
    id: string
    title: string
    images?: { url: string }[]
  }
  seller: {
    firstName: string
    lastName: string
  }
}

interface FortGjortOrderManagementProps {
  order: Order
  userRole: 'buyer' | 'seller'
  onStatusChange?: () => void
}

export default function FortGjortOrderManagement({ 
  order, 
  userRole, 
  onStatusChange 
}: FortGjortOrderManagementProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStatusInfo = () => {
    switch (order.status) {
      case 'PAYMENT_CONFIRMED':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Venter på sending',
          color: 'bg-yellow-100 text-yellow-800',
          description: userRole === 'seller' 
            ? 'Du må sende varen til kjøperen'
            : 'Venter på at selger sender varen'
        }
      case 'SHIPPED':
        return {
          icon: <Truck className="h-4 w-4" />,
          label: 'Sendt',
          color: 'bg-blue-100 text-blue-800',
          description: userRole === 'buyer' 
            ? 'Varen er sendt til deg'
            : 'Du har sendt varen'
        }
      case 'DELIVERED':
        return {
          icon: <Package className="h-4 w-4" />,
          label: 'Levert',
          color: 'bg-purple-100 text-purple-800',
          description: userRole === 'buyer' 
            ? 'Varen er levert - godkjenn når du har sjekket den'
            : 'Varen er levert til kjøperen'
        }
      case 'APPROVED':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Godkjent',
          color: 'bg-green-100 text-green-800',
          description: 'Kjøperen har godkjent varen - penger er overført'
        }
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Fullført',
          color: 'bg-green-100 text-green-800',
          description: 'Handel fullført - penger er overført til selger'
        }
      case 'EXPIRED':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Utløpt',
          color: 'bg-red-100 text-red-800',
          description: 'Ordren utløp fordi varen ikke ble sendt i tide'
        }
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: order.status,
          color: 'bg-gray-100 text-gray-800',
          description: ''
        }
    }
  }

  const handleApprove = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/fort-gjort/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Feil ved godkjenning')
        return
      }

      onStatusChange?.()

    } catch (err) {
      setError('Nettverksfeil ved godkjenning')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkShipped = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/fort-gjort/mark-shipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Feil ved marking som sendt')
        return
      }

      onStatusChange?.()

    } catch (err) {
      setError('Nettverksfeil')
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = getStatusInfo()
  const canApprove = userRole === 'buyer' && 
    (order.status === 'SHIPPED' || order.status === 'DELIVERED') &&
    (!order.approvalDeadline || new Date() < new Date(order.approvalDeadline))
  
  const canMarkShipped = userRole === 'seller' && order.status === 'PAYMENT_CONFIRMED'

  const isExpiringSoon = order.approvalDeadline && 
    new Date() > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dager igjen

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Fort gjort ordre
          <Badge className={statusInfo.color}>
            {statusInfo.icon}
            <span className="ml-1">{statusInfo.label}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-gray-600">{statusInfo.description}</p>
          
          {order.deliveryDeadline && order.status === 'PAYMENT_CONFIRMED' && (
            <p className="text-sm text-yellow-600">
              📦 Må sendes innen: {new Date(order.deliveryDeadline).toLocaleDateString('no-NO')}
            </p>
          )}
          
          {order.approvalDeadline && (order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <p className={`text-sm ${isExpiringSoon ? 'text-red-600' : 'text-blue-600'}`}>
              ⏰ Godkjenningsfrist: {new Date(order.approvalDeadline).toLocaleDateString('no-NO')}
            </p>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Varepris:</span>
              <span className="ml-2">{order.itemPrice.toLocaleString()} kr</span>
            </div>
            <div>
              <span className="font-medium">Kulbruk gebyr:</span>
              <span className="ml-2">{order.kulbrukFee.toLocaleString()} kr</span>
            </div>
            <div>
              <span className="font-medium">Totalt betalt:</span>
              <span className="ml-2 font-bold">{order.totalAmount.toLocaleString()} kr</span>
            </div>
            {userRole === 'seller' && (
              <div>
                <span className="font-medium">Du får utbetalt:</span>
                <span className="ml-2 font-bold text-green-600">{order.sellerPayout.toLocaleString()} kr</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {canMarkShipped && (
            <Button 
              onClick={handleMarkShipped} 
              disabled={loading}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Marker som sendt
            </Button>
          )}
          
          {canApprove && (
            <Button 
              onClick={handleApprove} 
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Godkjenn vare
            </Button>
          )}
        </div>

        {isExpiringSoon && userRole === 'buyer' && canApprove && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Viktig:</strong> Du har kun få dager igjen til å godkjenne varen. 
              Hvis du ikke godkjenner i tide, vil pengene automatisk bli overført til selger.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
