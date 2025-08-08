import { supabase } from './client'

export class ProfileSetupService {
  /**
   * Creates or updates a user profile after OAuth sign-in
   * This should be called in the callback route to ensure profile exists
   */
  static async ensureProfile(userId: string, email: string, metadata?: any) {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        console.log('Profile already exists for user:', userId)
        return existingProfile
      }

      // Create new profile
      const profileData = {
        id: userId,
        email: email,
        display_name: metadata?.full_name || metadata?.name || email.split('@')[0],
        avatar_url: metadata?.avatar_url || metadata?.picture,
        preferences: {
          currency: 'IDR',
          date_format: 'DD/MM/YYYY',
          theme: 'system',
          notifications: {
            budget_alerts: true,
            transaction_reminders: true,
            weekly_reports: false
          }
        }
      }

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        throw error
      }

      console.log('Profile created successfully for user:', userId)
      return newProfile

    } catch (error) {
      console.error('Error in ensureProfile:', error)
      throw error
    }
  }

  /**
   * Creates default categories for a new user
   */
  static async createDefaultCategories(userId: string) {
    try {
      const defaultCategories = [
        // Income categories
        { name: 'Salary', type: 'income', color: '#10B981', user_id: userId },
        { name: 'Freelance', type: 'income', color: '#059669', user_id: userId },
        { name: 'Investment', type: 'income', color: '#0D9488', user_id: userId },
        
        // Expense categories
        { name: 'Food & Dining', type: 'expense', color: '#EF4444', user_id: userId },
        { name: 'Transportation', type: 'expense', color: '#F59E0B', user_id: userId },
        { name: 'Shopping', type: 'expense', color: '#8B5CF6', user_id: userId },
        { name: 'Utilities', type: 'expense', color: '#3B82F6', user_id: userId },
        { name: 'Entertainment', type: 'expense', color: '#EC4899', user_id: userId },
        { name: 'Healthcare', type: 'expense', color: '#6366F1', user_id: userId },
      ]

      const { data, error } = await supabase
        .from('categories')
        .insert(defaultCategories)
        .select()

      if (error) {
        console.error('Error creating default categories:', error)
        throw error
      }

      console.log('Default categories created for user:', userId)
      return data

    } catch (error) {
      console.error('Error in createDefaultCategories:', error)
      throw error
    }
  }

  /**
   * Sets up a complete profile for a new user
   */
  static async setupNewUser(userId: string, email: string, metadata?: any) {
    try {
      console.log('Setting up new user:', userId)
      
      // Create profile
      const profile = await this.ensureProfile(userId, email, metadata)
      
      // Create default categories
      await this.createDefaultCategories(userId)
      
      console.log('User setup completed for:', userId)
      return profile

    } catch (error) {
      console.error('Error in setupNewUser:', error)
      throw error
    }
  }
}
