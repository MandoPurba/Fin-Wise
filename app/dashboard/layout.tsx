'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { AuthService } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Dashboard Layout: Checking authentication...')
      const currentUser = await AuthService.getCurrentUser()
      console.log('👤 Dashboard Layout: User result:', currentUser ? 'Found' : 'Not found')
      
      setUser(currentUser)
      setLoading(false)
      
      // Don't redirect immediately, let user see the UI first
      if (!currentUser) {
        console.log('❌ Dashboard Layout: No user found')
        // Delay redirect to allow UI to render
        setTimeout(() => {
          router.push('/auth/login')
        }, 100)
        return
      }
      
      console.log('✅ Dashboard Layout: User authenticated, showing dashboard')
    } catch (error) {
      console.error('💥 Dashboard Layout: Auth check failed:', error)
      setLoading(false)
      setTimeout(() => {
        router.push('/auth/login')
      }, 100)
    }
  }

  // Show loading only for a brief moment
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Show layout even if user is null (will redirect after render)
  return (
    <div className="flex h-screen bg-base">
      {/* Mobile sidebar backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between border-b border-surface-border bg-surface-1 px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold text-text-primary">FinWise</span>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {user ? children : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-text-secondary">Redirecting to login...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
