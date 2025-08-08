export { TransactionService } from './transactions'
export { AccountService } from './accounts'
export { CategoryService } from './categories'
export { BudgetService } from './budgets'
export { ProfileService } from './profiles'
export { AuthService } from './auth'
export { supabase } from './client'

import { TransactionService } from './transactions'
import { AccountService } from './accounts'

// Dashboard analytics
export class DashboardService {
  static async getDashboardStats(userId: string) {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    // Get monthly stats
    const monthlyStats = await TransactionService.getMonthlyStats(userId, currentYear, currentMonth)
    
    // Get total balance
    const totalBalance = await AccountService.getTotalBalance(userId)

    // Calculate savings rate
    const savingsRate = monthlyStats.income > 0 
      ? ((monthlyStats.income - monthlyStats.expenses) / monthlyStats.income) * 100 
      : 0

    return {
      totalBalance,
      monthlyIncome: monthlyStats.income,
      monthlyExpenses: monthlyStats.expenses,
      savingsRate: Math.max(0, savingsRate)
    }
  }

  static async getChartData(userId: string, months: number = 6) {
    const data = []
    const currentDate = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const stats = await TransactionService.getMonthlyStats(userId, year, month)
      
      data.push({
        date: date.toISOString().substring(0, 7), // YYYY-MM format
        income: stats.income,
        expenses: stats.expenses,
        balance: stats.income - stats.expenses
      })
    }

    return data
  }

  static async getCategoryExpenses(userId: string, months: number = 1) {
    const endDate = new Date()
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months + 1, 1)

    const breakdown = await TransactionService.getCategoryBreakdown(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    const expenses = breakdown
      .filter((item: any) => item.expense > 0)
      .map((item: any) => ({
        category: item.name,
        amount: item.expense,
        percentage: 0, // Will be calculated below
        color: item.color
      }))

    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + item.amount, 0)
    
    return expenses.map((item: any) => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
    }))
  }
}
