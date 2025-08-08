import { supabase } from './client'
import type { 
  Transaction, 
  TransactionWithDetails, 
  TransactionFormData,
  Category,
  Account
} from '@/types/database'

export class TransactionService {
  static async getAll(userId: string): Promise<TransactionWithDetails[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        account:accounts!transactions_account_id_fkey(*),
        from_account:accounts!transactions_from_account_id_fkey(*),
        to_account:accounts!transactions_to_account_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<TransactionWithDetails[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        account:accounts!transactions_account_id_fkey(*),
        from_account:accounts!transactions_from_account_id_fkey(*),
        to_account:accounts!transactions_to_account_id_fkey(*)
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async create(userId: string, data: TransactionFormData): Promise<Transaction> {
    const transactionData = {
      ...data,
      user_id: userId,
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single()

    if (error) throw error
    return transaction
  }

  static async update(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transaction
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getMonthlyStats(userId: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate)

    if (error) throw error

    const stats = {
      income: 0,
      expenses: 0,
      transfers: 0
    }

    data?.forEach(transaction => {
      switch (transaction.type) {
        case 'income':
          stats.income += Number(transaction.amount)
          break
        case 'expense':
          stats.expenses += Number(transaction.amount)
          break
        case 'transfer':
          stats.transfers += Number(transaction.amount)
          break
      }
    })

    return stats
  }

  static async getCategoryBreakdown(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        type,
        category:categories(name, color)
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .not('category_id', 'is', null)

    if (error) throw error

    const breakdown = new Map()
    
    data?.forEach((transaction: any) => {
      if (transaction.category) {
        const key = transaction.category.name
        if (!breakdown.has(key)) {
          breakdown.set(key, {
            name: transaction.category.name,
            color: transaction.category.color || '#6B7280',
            income: 0,
            expense: 0,
            total: 0
          })
        }
        
        const category = breakdown.get(key)
        const amount = Number(transaction.amount)
        
        if (transaction.type === 'income') {
          category.income += amount
        } else if (transaction.type === 'expense') {
          category.expense += amount
        }
        
        category.total = category.income - category.expense
      }
    })

    return Array.from(breakdown.values())
  }
}
