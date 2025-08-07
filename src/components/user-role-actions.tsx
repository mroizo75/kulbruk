'use client'

import { useState } from 'react'
import { Crown, Shield, Users, User, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UserRoleActionsProps {
  userId: string
  currentRole: string
  userName: string
}

const roleOptions = [
  { value: 'admin', label: 'Admin', icon: Crown, color: 'text-red-600', description: 'Full tilgang til alt' },
  { value: 'moderator', label: 'Moderator', icon: Shield, color: 'text-blue-600', description: 'Kan godkjenne annonser' },
  { value: 'business', label: 'Bedrift', icon: Users, color: 'text-green-600', description: 'Bedriftskonto' },
  { value: 'customer', label: 'Kunde', icon: User, color: 'text-gray-600', description: 'Standard bruker' },
]

export default function UserRoleActions({ userId, currentRole, userName }: UserRoleActionsProps) {
  const [isChanging, setIsChanging] = useState(false)
  const router = useRouter()

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return

    setIsChanging(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kunne ikke endre rolle')
      }

      const roleOption = roleOptions.find(r => r.value === newRole)
      toast.success(`${userName} er nå ${roleOption?.label || newRole}`)
      router.refresh()
      
    } catch (error: any) {
      console.error('Feil ved rolle-endring:', error)
      toast.error(error.message || 'Kunne ikke endre rolle')
    } finally {
      setIsChanging(false)
    }
  }

  const currentRoleOption = roleOptions.find(r => r.value === currentRole)
  const availableRoles = roleOptions.filter(r => r.value !== currentRole)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isChanging}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Endre rolle</DropdownMenuLabel>
        <div className="px-2 py-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {currentRoleOption && (
              <>
                <currentRoleOption.icon className="h-3 w-3" />
                Nåværende: {currentRoleOption.label}
              </>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => handleRoleChange(role.value)}
            disabled={isChanging}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <role.icon className={`h-4 w-4 ${role.color}`} />
                <div>
                  <div className="font-medium">{role.label}</div>
                  <div className="text-xs text-gray-500">{role.description}</div>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}