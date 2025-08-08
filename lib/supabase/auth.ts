import { supabase } from './client'
import type { User } from '@supabase/supabase-js'

export class AuthService {
  static async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })

    if (error) throw error
    return data
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  static async signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'apple') {
    // Import browser client for OAuth (handles PKCE correctly)
    const { createBrowserClient } = await import('@supabase/ssr')
    
    const supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  static async signOut() {
    try {
      // Use browser client for logout
      const { createBrowserClient } = await import('@supabase/ssr')
      
      const supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('signOut error:', error)
      throw error
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      // Use browser client for better SSR support
      const { createBrowserClient } = await import('@supabase/ssr')
      
      const supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user }, error } = await supabaseClient.auth.getUser()
      
      if (error) {
        console.error('getCurrentUser error:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('getCurrentUser exception:', error)
      return null
    }
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
  }

  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}
