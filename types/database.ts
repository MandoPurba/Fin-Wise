// Database Types
export interface Profile {
  id: string
  display_name?: string
  avatar_url?: string
  currency: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon?: string
  color?: string
  type: 'income' | 'expense'
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  currency: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id?: string
  category_id?: string
  from_account_id?: string // For transfers
  to_account_id?: string   // For transfers
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description?: string
  date: string
  receipt_url?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  created_at: string
}

// Extended types with relations
export interface TransactionWithDetails extends Transaction {
  category?: Category
  account?: Account
  from_account?: Account
  to_account?: Account
}

export interface BudgetWithCategory extends Budget {
  category: Category
  spent?: number
  percentage?: number
}

// Form types
export interface TransactionFormData {
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description?: string
  category_id?: string
  account_id?: string
  from_account_id?: string
  to_account_id?: string
  date: string
  tags?: string[]
}

export interface CategoryFormData {
  name: string
  icon?: string
  color?: string
  type: 'income' | 'expense'
}

export interface AccountFormData {
  name: string
  type?: string
  balance: number
  currency: string
}

export interface BudgetFormData {
  category_id: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
}

// UI Types
export interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
}

export interface ChartDataPoint {
  date: string
  income: number
  expenses: number
  balance: number
}

export interface CategoryExpense {
  category: string
  amount: number
  percentage: number
  color: string
}
