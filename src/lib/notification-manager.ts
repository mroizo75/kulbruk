// Real-time notification manager for Server-Sent Events
// Håndterer alle admin/moderator notifikasjoner

interface Notification {
  id: string
  type: 'new_listing' | 'new_report' | 'user_registered' | 'listing_approved' | 'listing_rejected'
  title: string
  message: string
  data?: any
  timestamp: Date
  targetRoles: ('admin' | 'moderator')[]
}

class NotificationManager {
  private static instance: NotificationManager
  private connections: Map<string, Response> = new Map()
  private controllers: Map<string, ReadableStreamDefaultController> = new Map()

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  // Legg til SSE connection for en bruker
  addConnection(userId: string, controller: ReadableStreamDefaultController, response: Response) {
    this.connections.set(userId, response)
    this.controllers.set(userId, controller)
    
    console.log(`SSE: Admin/Moderator ${userId} koblet til notifikasjoner`)
    
    // Send initial heartbeat
    this.sendToUser(userId, {
      id: `heartbeat_${Date.now()}`,
      type: 'heartbeat',
      title: 'Tilkoblet',
      message: 'Real-time notifikasjoner er aktive',
      timestamp: new Date(),
      targetRoles: ['admin', 'moderator']
    })
  }

  // Fjern SSE connection
  removeConnection(userId: string) {
    const controller = this.controllers.get(userId)
    if (controller) {
      try {
        controller.close()
      } catch (error) {
        console.log(`SSE: Connection allerede lukket for ${userId}`)
      }
    }
    
    this.connections.delete(userId)
    this.controllers.delete(userId)
    console.log(`SSE: Admin/Moderator ${userId} koblet fra notifikasjoner`)
  }

  // Send notifikasjon til alle tilkoblede admin/moderatorer
  broadcast(notification: Notification) {
    console.log(`SSE: Broadcasting notification: ${notification.type} - ${notification.title}`)
    
    this.controllers.forEach((controller, userId) => {
      try {
        this.sendToUser(userId, notification)
      } catch (error) {
        console.error(`SSE: Feil ved sending til ${userId}:`, error)
        this.removeConnection(userId)
      }
    })
  }

  // Send notifikasjon til spesifikk bruker
  private sendToUser(userId: string, notification: Notification) {
    const controller = this.controllers.get(userId)
    if (!controller) return

    try {
      const data = JSON.stringify({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: notification.timestamp.toISOString(),
        targetRoles: notification.targetRoles
      })

      const message = `data: ${data}\n\n`
      controller.enqueue(new TextEncoder().encode(message))
    } catch (error) {
      console.error(`SSE: Kunne ikke sende til ${userId}:`, error)
      this.removeConnection(userId)
    }
  }

  // Get connection count for debugging
  getConnectionCount(): number {
    return this.connections.size
  }

  // Get connected user IDs for debugging
  getConnectedUsers(): string[] {
    return Array.from(this.connections.keys())
  }
}

// Helper functions for triggering notifications
export const notificationManager = NotificationManager.getInstance()

export function notifyNewListing(listing: any) {
  // Send to admin/moderator for approval
  notificationManager.broadcast({
    id: `listing_${listing.id}_${Date.now()}`,
    type: 'new_listing',
    title: listing.title,
    message: `Ny annonse fra ${listing.user?.firstName} ${listing.user?.lastName}`,
    data: { listingId: listing.id, category: listing.category },
    timestamp: new Date(),
    targetRoles: ['admin', 'moderator']
  })
}

export function notifyNewAuctionToBusiness(listing: any) {
  // Send to business users when new car auction is approved
  // This would filter based on business notification preferences
  notificationManager.broadcast({
    id: `new_auction_${listing.id}_${Date.now()}`,
    type: 'new_auction',
    title: `Ny auksjon: ${listing.title}`,
    message: `${listing.vehicleSpec?.make || 'Bil'} ${listing.vehicleSpec?.model || ''} - ${listing.location}`,
    data: { 
      listingId: listing.id, 
      make: listing.vehicleSpec?.make,
      model: listing.vehicleSpec?.model,
      year: listing.vehicleSpec?.year,
      price: listing.estimatedPrice,
      location: listing.location
    },
    timestamp: new Date(),
    targetRoles: ['business']
  })
  
  console.log('🚗 Ny auksjon sendt til bedrifter:', {
    title: listing.title,
    make: listing.vehicleSpec?.make,
    model: listing.vehicleSpec?.model,
    estimatedPrice: listing.estimatedPrice
  })
}

export function notifyListingApproved(listing: any) {
  notificationManager.broadcast({
    id: `approved_${listing.id}_${Date.now()}`,
    type: 'listing_approved',
    title: `Annonse godkjent: ${listing.title}`,
    message: `Annonsen er nå publisert og synlig for brukere`,
    data: { listingId: listing.id },
    timestamp: new Date(),
    targetRoles: ['admin']
  })
}

export function notifyListingRejected(listing: any, reason?: string) {
  notificationManager.broadcast({
    id: `rejected_${listing.id}_${Date.now()}`,
    type: 'listing_rejected',
    title: `Annonse avvist: ${listing.title}`,
    message: reason ? `Grunn: ${reason}` : 'Annonsen ble avvist av moderator',
    data: { listingId: listing.id, reason },
    timestamp: new Date(),
    targetRoles: ['admin']
  })
}

export function notifyNewReport(report: any) {
  notificationManager.broadcast({
    id: `report_${report.id}_${Date.now()}`,
    type: 'new_report',
    title: `Ny rapport: ${report.listingTitle}`,
    message: `Rapportert av ${report.reportedBy} - ${report.reason}`,
    data: { reportId: report.id, listingId: report.listingId },
    timestamp: new Date(),
    targetRoles: ['admin', 'moderator']
  })
}

export function notifyNewUser(user: any) {
  const title = user.role === 'business' && user.companyName
    ? `Ny bedrift: ${user.companyName}`
    : `Ny bruker: ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Ny bruker'
  
  const message = user.role === 'business'
    ? `Bedrift registrert: ${user.companyName || 'Ukjent bedrift'}`
    : `Registrert med rolle: ${user.role}`

  notificationManager.broadcast({
    id: `user_${user.id}_${Date.now()}`,
    type: 'user_registered',
    title: title,
    message: message,
    data: { 
      userId: user.id, 
      role: user.role,
      companyName: user.companyName 
    },
    timestamp: new Date(),
    targetRoles: ['admin']
  })
}

export default NotificationManager
