import { supabase } from './client'
import type { Category, CategoryFormData } from '@/types/database'

export class CategoryService {
  static async getAll(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getByType(userId: string, type: 'income' | 'expense'): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(userId: string, data: CategoryFormData): Promise<Category> {
    const categoryData = {
      ...data,
      user_id: userId,
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single()

    if (error) throw error
    return category
  }

  static async update(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    const { data: category, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return category
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
