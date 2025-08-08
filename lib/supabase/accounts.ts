import { supabase } from './client'
import type { Account, AccountFormData } from '@/types/database'

export class AccountService {
  static async getAll(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(userId: string, data: AccountFormData): Promise<Account> {
    const accountData = {
      ...data,
      user_id: userId,
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert([accountData])
      .select()
      .single()

    if (error) throw error
    return account
  }

  static async update(id: string, data: Partial<AccountFormData>): Promise<Account> {
    const { data: account, error } = await supabase
      .from('accounts')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return account
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async updateBalance(id: string, newBalance: number): Promise<Account> {
    const { data: account, error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return account
  }

  static async getTotalBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)

    if (error) throw error

    return data?.reduce((total, account) => total + Number(account.balance), 0) || 0
  }
}
