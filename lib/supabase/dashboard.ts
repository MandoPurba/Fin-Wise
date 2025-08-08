import { supabase } from './client'
import type { DashboardStats, ChartDataPoint, CategoryExpense } from '@/types/database'

export class DashboardService {
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get total balance from all accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)

      if (accountsError) throw accountsError

      const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0

      // Get current month's income and expenses
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)

      if (transactionsError) throw transactionsError

      const monthlyIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      const monthlyExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savingsRate
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0
      }
    }
  }

  static async getChartData(userId: string, months: number = 6): Promise<ChartDataPoint[]> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true })

      if (error) throw error

      // Group transactions by month
      const monthlyData: { [key: string]: { income: number; expenses: number } } = {}
      
      transactions?.forEach(transaction => {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0 }
        }
        
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount
        } else if (transaction.type === 'expense') {
          monthlyData[monthKey].expenses += transaction.amount
        }
      })

      // Convert to chart format
      let runningBalance = 0
      const chartData: ChartDataPoint[] = []

      Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([monthKey, data]) => {
          runningBalance += data.income - data.expenses
          chartData.push({
            date: `${monthKey}-01`,
            income: data.income,
            expenses: data.expenses,
            balance: runningBalance
          })
        })

      return chartData
    } catch (error) {
      console.error('Error getting chart data:', error)
      return []
    }
  }

  static async getCategoryExpenses(userId: string, months: number = 1): Promise<CategoryExpense[]> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          categories!inner(name, color)
        `)
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())

      if (error) throw error

      // Group by category
      const categoryMap: { [key: string]: { amount: number; color: string } } = {}
      
      data?.forEach(transaction => {
        const categoryName = transaction.categories.name
        const color = transaction.categories.color
        
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = { amount: 0, color }
        }
        categoryMap[categoryName].amount += transaction.amount
      })

      return Object.entries(categoryMap).map(([name, data]) => ({
        name,
        amount: data.amount,
        color: data.color
      }))
    } catch (error) {
      console.error('Error getting category expenses:', error)
      return []
    }
  }
}
