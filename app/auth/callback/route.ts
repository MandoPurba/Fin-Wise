import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  // if "next" is in param, use it as the redirect URL, default to dashboard
  let next = searchParams.get('next') ?? '/dashboard'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/dashboard'
  }

  console.log('=== OAuth Callback ===')
  console.log('Code:', code ? 'Present' : 'Missing')
  console.log('Error:', error)
  console.log('Next destination:', next)

  // Handle OAuth errors
  if (error) {
    console.error('OAuth Error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_error&message=${encodeURIComponent(error)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Session Exchange Error:', exchangeError?.message || 'None')
    
    if (!exchangeError) {
      console.log('OAuth Success! Redirecting to:', next)
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('Session exchange failed:', exchangeError)
      return NextResponse.redirect(`${origin}/auth/login?error=session_failed&message=${encodeURIComponent(exchangeError.message)}`)
    }
  }

  // No code provided
  console.log('No code provided in callback')
  return NextResponse.redirect(`${origin}/auth/login?error=no_code&message=No+authorization+code+provided`)
}
