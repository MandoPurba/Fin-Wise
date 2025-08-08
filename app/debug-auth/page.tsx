'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthService } from '@/lib/supabase'

export default function DebugAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
    console.log(message)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    addLog('🔍 Starting auth check...')
    setLoading(true)
    
    try {
      const currentUser = await AuthService.getCurrentUser()
      addLog(`👤 Auth result: ${currentUser ? 'User found' : 'No user'}`)
      
      if (currentUser) {
        addLog(`📧 User email: ${currentUser.email}`)
        addLog(`🆔 User ID: ${currentUser.id}`)
      }
      
      setUser(currentUser)
    } catch (error: any) {
      addLog(`❌ Auth error: ${error.message}`)
    } finally {
      setLoading(false)
      addLog('✅ Auth check completed')
    }
  }

  const testOAuth = async () => {
    addLog('🚀 Testing GitHub OAuth...')
    try {
      await AuthService.signInWithOAuth('github')
      addLog('✅ OAuth initiated')
    } catch (error: any) {
      addLog(`❌ OAuth error: ${error.message}`)
    }
  }

  const testSignOut = async () => {
    addLog('🚪 Testing sign out...')
    try {
      await AuthService.signOut()
      addLog('✅ Signed out successfully')
      await checkAuth() // Re-check auth status
    } catch (error: any) {
      addLog(`❌ Sign out error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4">
      <Card className="w-full max-w-2xl bg-surface-1 border-surface-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-text-primary">
            Authentication Debug Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Status */}
          <div className="p-4 bg-surface-0 border border-surface-border rounded-md">
            <h3 className="font-semibold text-text-primary mb-2">Auth Status:</h3>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
                <span className="text-text-secondary">Checking...</span>
              </div>
            ) : user ? (
              <div className="space-y-1">
                <p className="text-green-500">✅ Authenticated</p>
                <p className="text-text-secondary text-sm">Email: {user.email}</p>
                <p className="text-text-secondary text-sm">ID: {user.id}</p>
              </div>
            ) : (
              <p className="text-red-500">❌ Not authenticated</p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={checkAuth} variant="outline" className="w-full">
              🔄 Refresh Auth Status
            </Button>
            
            {!user && (
              <Button onClick={testOAuth} className="w-full">
                🐙 Login with GitHub
              </Button>
            )}
            
            {user && (
              <Button onClick={testSignOut} variant="destructive" className="w-full">
                🚪 Sign Out
              </Button>
            )}
            
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="secondary" 
              className="w-full"
              disabled={!user}
            >
              📊 Go to Dashboard
            </Button>
          </div>
          
          {/* Debug Logs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-text-primary">Debug Logs:</h3>
              <Button 
                onClick={() => setLogs([])} 
                variant="ghost" 
                size="sm"
              >
                Clear
              </Button>
            </div>
            <div className="p-4 bg-surface-0 border border-surface-border rounded-md max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-text-muted">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm text-text-primary font-mono mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
