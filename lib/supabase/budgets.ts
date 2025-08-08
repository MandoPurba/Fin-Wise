import { supabase } from './client'
import type { Budget, BudgetWithCategory, BudgetFormData } from '@/types/database'

export class BudgetService {
  static async getAll(userId: string): Promise<BudgetWithCategory[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getCurrent(userId: string): Promise<BudgetWithCategory[]> {
    const now = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      (data || []).map(async (budget) => {
        const spent = await this.getSpentAmount(userId, budget.category_id, budget.start_date, budget.end_date)
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        
        return {
          ...budget,
          spent,
          percentage
        }
      })
    )

    return budgetsWithSpent
  }

  static async getById(id: string): Promise<BudgetWithCategory | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(userId: string, data: BudgetFormData): Promise<Budget> {
    const budgetData = {
      ...data,
      user_id: userId,
    }

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert([budgetData])
      .select()
      .single()

    if (error) throw error
    return budget
  }

  static async update(id: string, data: Partial<BudgetFormData>): Promise<Budget> {
    const { data: budget, error } = await supabase
      .from('budgets')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return budget
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getSpentAmount(
    userId: string, 
    categoryId: string, 
    startDate: string, 
    endDate: string
  ): Promise<number> {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error

    return data?.reduce((total, transaction) => total + Number(transaction.amount), 0) || 0
  }

  static async getBudgetProgress(userId: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0] // Last day of month

    const budgets = await this.getCurrent(userId)
    const monthlyBudgets = budgets.filter(budget => {
      return budget.period === 'monthly' && 
             budget.start_date <= endDate && 
             budget.end_date >= startDate
    })

    return monthlyBudgets
  }
}
