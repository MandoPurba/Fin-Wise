'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AuthService } from '@/lib/supabase'
import {
  Home,
  CreditCard,
  PiggyBank,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Receipt,
  BarChart3
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Transaksi',
    href: '/dashboard/transactions',
    icon: Receipt,
  },
  {
    name: 'Akun',
    href: '/dashboard/accounts',
    icon: CreditCard,
  },
  {
    name: 'Budget',
    href: '/dashboard/budgets',
    icon: Target,
  },
  {
    name: 'Investasi',
    href: '/dashboard/investments',
    icon: TrendingUp,
  },
  {
    name: 'Laporan',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    name: 'Profil',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    name: 'Pengaturan',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await AuthService.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className={cn('flex h-full flex-col bg-surface-1 border-r border-surface-border', className)}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-surface-border">
        <div className="flex items-center space-x-2">
          <PiggyBank className="h-8 w-8 text-accent" />
          {!isCollapsed && (
            <span className="text-xl font-bold text-text-primary">FinWise</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-base'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn('h-4 w-4', !isCollapsed && 'mr-3')} />
                {!isCollapsed && item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-surface-border p-3">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full justify-start text-text-secondary hover:text-text-primary hover:bg-surface-2',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-3')} />
          {!isCollapsed && 'Keluar'}
        </Button>
      </div>
    </div>
  )
}
