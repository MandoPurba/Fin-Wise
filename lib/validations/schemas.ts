import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(255),
  category_id: z.string().uuid('Invalid category'),
  account_id: z.string().uuid('Invalid account'),
  date: z.string().min(1, 'Date is required'),
  tags: z.array(z.string()).optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50),
  type: z.string().min(1, 'Account type is required'),
  balance: z.number().default(0),
  currency: z.string().default('IDR'),
})

export const budgetSchema = z.object({
  category_id: z.string().uuid('Invalid category'),
  amount: z.number().positive('Budget amount must be positive'),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
})

export const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50),
  currency: z.string().default('IDR'),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type AccountFormData = z.infer<typeof accountSchema>
export type BudgetFormData = z.infer<typeof budgetSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
