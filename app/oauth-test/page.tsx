'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OAuthTestPage() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const testGitHubOAuth = async () => {
    addLog('🔄 Starting GitHub OAuth test...')
    
    try {
      // Import supabase client
      const { createBrowserClient } = await import('@supabase/ssr')
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      addLog(`📍 Current URL: ${window.location.origin}`)
      addLog(`🔗 Callback URL: ${window.location.origin}/auth/callback`)
      addLog(`🏠 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        addLog(`❌ OAuth Error: ${error.message}`)
      } else {
        addLog(`✅ OAuth initiated successfully!`)
        addLog(`🌐 OAuth URL: ${data.url}`)
        addLog(`🚀 Should redirect to GitHub now...`)
        // The browser will redirect automatically
      }
    } catch (err: any) {
      addLog(`💥 Exception: ${err.message}`)
    }
  }

  const directGitHubTest = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const redirectTo = encodeURIComponent(`${window.location.origin}/auth/callback`)
    const directUrl = `${supabaseUrl}/auth/v1/authorize?provider=github&redirect_to=${redirectTo}`
    
    addLog(`🔗 Direct GitHub URL: ${directUrl}`)
    addLog(`🚀 Opening in new tab...`)
    
    window.open(directUrl, '_blank')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4">
      <Card className="w-full max-w-2xl bg-surface-1 border-surface-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-text-primary">
            GitHub OAuth Debug Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={testGitHubOAuth} className="w-full">
              🐙 Test GitHub OAuth (Normal Flow)
            </Button>
            
            <Button onClick={directGitHubTest} variant="outline" className="w-full">
              🔗 Test Direct GitHub URL (New Tab)
            </Button>
            
            <Button 
              onClick={() => setLogs([])} 
              variant="secondary" 
              className="w-full"
            >
              🗑️ Clear Logs
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Debug Logs:</h3>
            <div className="p-4 bg-surface-0 border border-surface-border rounded-md max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-text-muted">Click a button to start testing...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm text-text-primary font-mono mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-xs text-text-secondary space-y-2 p-3 bg-surface-0 rounded-md">
            <p><strong>Yang Harus Terjadi:</strong></p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Klik tombol GitHub OAuth</li>
              <li>Browser redirect ke GitHub untuk authorize</li>
              <li>Setelah authorize, GitHub redirect kembali ke /auth/callback dengan code parameter</li>
              <li>Callback route exchange code untuk session</li>
              <li>Redirect ke /dashboard</li>
            </ol>
            
            <p className="mt-3"><strong>Jika callback dipanggil tanpa code:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Cek Supabase Dashboard → Authentication → URL Configuration</li>
              <li>Cek Supabase Dashboard → Authentication → Providers → GitHub</li>
              <li>Cek GitHub OAuth App settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
