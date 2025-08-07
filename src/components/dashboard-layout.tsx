"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Plus, 
  FileText, 
  Heart, 
  Settings, 
  Users, 
  AlertTriangle, 
  BarChart3,
  Menu,
  X,
  Shield,
  ArrowLeft,
  LogOut,
  Gavel,
  Target,
  Bell,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SignOutButton, useUser } from '@clerk/nextjs'
import AdminNotificationBell from './admin-notification-bell'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: 'customer' | 'admin' | 'moderator' | 'business'
}

export default function DashboardLayout({ children, userRole = 'customer' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  // Navigasjonsmenyer basert på brukerrolle
  const customerNavigation = [
    { name: 'Dashboard', href: '/dashboard/customer', icon: Home },
    { name: 'Legg ut annonse', href: '/opprett', icon: Plus },
    { name: 'Mine annonser', href: '/dashboard/customer/annonser', icon: FileText },
    { name: 'Favoritter', href: '/dashboard/customer/favoritter', icon: Heart },
    { name: 'Innstillinger', href: '/dashboard/customer/innstillinger', icon: Settings },
  ]

  const adminNavigation = [
    { name: 'Oversikt', href: '/dashboard/admin', icon: Home },
    { name: 'Database', href: '/dashboard/admin/database', icon: Database },
    { name: 'Moderering', href: '/dashboard/admin/moderering', icon: AlertTriangle },
    { name: 'Alle annonser', href: '/dashboard/admin/annonser', icon: FileText },
    { name: 'Brukere', href: '/dashboard/admin/brukere', icon: Users },
    { name: 'Statistikk', href: '/dashboard/admin/statistikk', icon: BarChart3 },
    { name: 'Innstillinger', href: '/dashboard/admin/innstillinger', icon: Settings },
  ]

  const moderatorNavigation = [
    { name: 'Moderator Dashboard', href: '/dashboard/moderator', icon: Home },
    { name: 'Godkjenn annonser', href: '/dashboard/moderator/annonser', icon: FileText },
    { name: 'Behandle rapporter', href: '/dashboard/moderator/rapporter', icon: AlertTriangle },
  ]

  const businessNavigation = [
    { name: 'Business Dashboard', href: '/dashboard/business', icon: Home },
    { name: 'Auksjoner', href: '/dashboard/business/auksjoner', icon: Gavel },
    { name: 'Mine bud', href: '/dashboard/business/mine-bud', icon: Target },
    { name: 'Profit-kalkulator', href: '/dashboard/business/profit', icon: BarChart3 },
    { name: 'Varsler', href: '/dashboard/business/varsler', icon: Bell },
    { name: 'Bedriftsprofil', href: '/dashboard/business/innstillinger', icon: Users },
  ]

  const getNavigation = () => {
    switch (userRole) {
      case 'admin':
        return adminNavigation
      case 'moderator':
        return moderatorNavigation
      case 'business':
        return businessNavigation
      default:
        return customerNavigation
    }
  }

  const navigation = getNavigation()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold mr-2">
                K
              </div>
              <span className="text-lg font-bold text-gray-900">Kulbruk.no</span>
            </Link>
            {userRole === 'admin' && (
              <div className="ml-2 flex items-center space-x-1">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600 font-semibold">ADMIN</span>
              </div>
            )}
            {userRole === 'moderator' && (
              <div className="ml-2 flex items-center space-x-1">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-orange-600 font-semibold">MODERATOR</span>
              </div>
            )}
            {userRole === 'business' && (
              <div className="ml-2 flex items-center space-x-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-blue-600 font-semibold">BEDRIFT</span>
              </div>
            )}
          </div>
          
          {/* Notifikasjoner og close button */}
          <div className="flex items-center gap-2">
            <AdminNotificationBell userRole={userRole} />
            
            {/* Mobile close button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasjon */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 border-l-4 border-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer med brukerinfo og sign out */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="text-xs text-gray-500">
          Logget inn som {user?.firstName || 'Bruker'}
          <br />
          <span className="text-blue-600 font-medium">
            {userRole === 'admin' ? 'Administrator' :
             userRole === 'business' ? 'Bedrift' :
             userRole === 'moderator' ? 'Moderator' : 'Kunde'}
          </span>
        </div>
        
        <SignOutButton>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logg ut
          </Button>
        </SignOutButton>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-80 lg:block">
        <div className="h-full bg-white border-r border-gray-200 shadow-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2"
            >
              <Menu className="h-5 w-5" />
              <span>Dashboard Meny</span>
            </Button>
            
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Forsiden</span>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}