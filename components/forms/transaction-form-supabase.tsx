'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, PlusIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { AuthService, CategoryService, AccountService, TransactionService } from '@/lib/supabase'
import type { TransactionFormData, Category, Account } from '@/types/database'
import { useRouter } from 'next/navigation'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  from_account_id: z.string().optional(),
  to_account_id: z.string().optional(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
})

interface TransactionFormProps {
  onSuccess?: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
    }
  })

  const watchedType = watch('type')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (date) {
      setValue('date', format(date, 'yyyy-MM-dd'))
    }
  }, [date, setValue])

  const loadInitialData = async () => {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUserId(user.id)
      
      const [categoriesData, accountsData] = await Promise.all([
        CategoryService.getAll(user.id),
        AccountService.getAll(user.id)
      ])

      setCategories(categoriesData)
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const onSubmit = async (data: TransactionFormData) => {
    if (!userId) return

    setLoading(true)
    try {
      await TransactionService.create(userId, {
        ...data,
        amount: Number(data.amount)
      })

      reset()
      setDate(new Date())
      onSuccess?.()
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category => {
    if (watchedType === 'transfer') return false
    return category.type === watchedType
  })

  return (
    <Card className="bg-surface-1 border-surface-border">
      <CardHeader>
        <CardTitle className="text-text-primary">Tambah Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="text-text-primary">Tipe Transaksi</Label>
            <Select 
              onValueChange={(value) => setValue('type', value as 'income' | 'expense' | 'transfer')}
              defaultValue="expense"
            >
              <SelectTrigger className="bg-surface-0 border-surface-border text-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface-1 border-surface-border">
                <SelectItem value="income" className="text-text-primary hover:bg-surface-2">Pemasukan</SelectItem>
                <SelectItem value="expense" className="text-text-primary hover:bg-surface-2">Pengeluaran</SelectItem>
                <SelectItem value="transfer" className="text-text-primary hover:bg-surface-2">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-text-primary">Jumlah (IDR)</Label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="bg-surface-0 border-surface-border text-text-primary"
              placeholder="0"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Category (only for income/expense) */}
          {watchedType !== 'transfer' && (
            <div className="space-y-2">
              <Label className="text-text-primary">Kategori</Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger className="bg-surface-0 border-surface-border text-text-primary">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-surface-1 border-surface-border">
                  {filteredCategories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="text-text-primary hover:bg-surface-2"
                    >
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Account Selection */}
          {watchedType !== 'transfer' ? (
            <div className="space-y-2">
              <Label className="text-text-primary">Akun</Label>
              <Select onValueChange={(value) => setValue('account_id', value)}>
                <SelectTrigger className="bg-surface-0 border-surface-border text-text-primary">
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent className="bg-surface-1 border-surface-border">
                  {accounts.map((account) => (
                    <SelectItem 
                      key={account.id} 
                      value={account.id}
                      className="text-text-primary hover:bg-surface-2"
                    >
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* From Account */}
              <div className="space-y-2">
                <Label className="text-text-primary">Dari Akun</Label>
                <Select onValueChange={(value) => setValue('from_account_id', value)}>
                  <SelectTrigger className="bg-surface-0 border-surface-border text-text-primary">
                    <SelectValue placeholder="Pilih akun" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-1 border-surface-border">
                    {accounts.map((account) => (
                      <SelectItem 
                        key={account.id} 
                        value={account.id}
                        className="text-text-primary hover:bg-surface-2"
                      >
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Account */}
              <div className="space-y-2">
                <Label className="text-text-primary">Ke Akun</Label>
                <Select onValueChange={(value) => setValue('to_account_id', value)}>
                  <SelectTrigger className="bg-surface-0 border-surface-border text-text-primary">
                    <SelectValue placeholder="Pilih akun" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-1 border-surface-border">
                    {accounts.map((account) => (
                      <SelectItem 
                        key={account.id} 
                        value={account.id}
                        className="text-text-primary hover:bg-surface-2"
                      >
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-text-primary">Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-surface-0 border-surface-border text-text-primary",
                    !date && "text-text-muted"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-surface-1 border-surface-border">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-text-primary">Deskripsi</Label>
            <Textarea
              {...register('description')}
              className="bg-surface-0 border-surface-border text-text-primary"
              placeholder="Deskripsi transaksi (opsional)"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent text-base hover:bg-accent/90"
            disabled={loading}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {loading ? 'Menyimpan...' : 'Tambah Transaksi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
