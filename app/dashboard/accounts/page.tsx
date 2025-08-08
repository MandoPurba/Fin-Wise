'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { Plus, CreditCard, PiggyBank, Wallet, Building2, AlertCircle } from 'lucide-react'
import { AccountService, AuthService } from '@/lib/supabase'
import type { Account } from '@/types/database'

const getAccountIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'checking':
      return Wallet
    case 'savings':
      return PiggyBank
    case 'credit':
      return CreditCard
    default:
      return Building2
  }
}

const getAccountColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'checking':
      return 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
    case 'savings':
      return 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
    case 'credit':
      return 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
    default:
      return 'bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-400'
  }
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true)
        setError(null)

        const user = await AuthService.getCurrentUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        const accountsData = await AccountService.getAll(user.id)
        setAccounts(accountsData)
      } catch (err) {
        console.error('Error loading accounts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load accounts')
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <div className="flex justify-between mt-2">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground">
              Manage your financial accounts and track balances.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts and track balances.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Across {accounts.length} accounts
          </p>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No accounts found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first account
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type)
            const color = getAccountColor(account.type)
            
            return (
              <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{account.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">{account.type}</Badge>
                  </div>
                  <div className={`rounded-full p-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div
                      className={`text-2xl font-bold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(account.balance)}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{account.currency || 'IDR'}</span>
                      <span>
                        {account.type.toLowerCase() === 'credit' ? 'Available' : 'Balance'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Account Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 text-center border-dashed border-2 hover:bg-gray-50 cursor-pointer">
          <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-medium">Add New Account</h3>
          <p className="text-sm text-muted-foreground">
            Connect your bank account or add manually
          </p>
        </Card>
        
        <Card className="p-6 text-center hover:bg-gray-50 cursor-pointer">
          <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-medium">Transfer Money</h3>
          <p className="text-sm text-muted-foreground">
            Move funds between accounts
          </p>
        </Card>
        
        <Card className="p-6 text-center hover:bg-gray-50 cursor-pointer">
          <PiggyBank className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-medium">Set Goals</h3>
          <p className="text-sm text-muted-foreground">
            Create savings and budget goals
          </p>
        </Card>
      </div>
    </div>
  )
}
