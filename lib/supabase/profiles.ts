import { supabase } from './client'
import type { Profile } from '@/types/database'

export class ProfileService {
  static async getCurrent(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  }

  static async update(data: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return profile
  }

  static async create(userId: string, data: Partial<Profile>): Promise<Profile> {
    const profileData = {
      id: userId,
      currency: 'IDR',
      ...data,
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) throw error
    return profile
  }
}
