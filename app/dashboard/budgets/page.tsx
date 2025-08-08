'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { PlusIcon, AlertCircle, Target } from 'lucide-react'
import { BudgetService, AuthService } from '@/lib/supabase'
import type { BudgetWithCategory } from '@/types/database'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setLoading(true)
        setError(null)

        const user = await AuthService.getCurrentUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        const budgetsData = await BudgetService.getAll(user.id)
        setBudgets(budgetsData)
      } catch (err) {
        console.error('Error loading budgets:', err)
        setError(err instanceof Error ? err.message : 'Failed to load budgets')
      } finally {
        setLoading(false)
      }
    }

    loadBudgets()
  }, [])

  const calculateBudgetPercentage = (spent: number, budgeted: number) => {
    if (budgeted === 0) return 0
    return Math.min((spent / budgeted) * 100, 100)
  }

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { color: 'text-red-500', status: 'Over budget' }
    if (percentage >= 80) return { color: 'text-orange-500', status: 'Near limit' }
    return { color: 'text-green-500', status: 'On track' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Budgets</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Budget
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Track your spending against your budget goals.
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No budgets found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first budget to track your spending
          </p>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {budgets.map((budget) => {
            const spent = budget.spent || 0
            const percentage = calculateBudgetPercentage(spent, budget.amount)
            const status = getBudgetStatus(percentage)
            const remaining = budget.amount - spent

            return (
              <Card key={budget.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{budget.category?.name || 'Uncategorized'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      <div>{formatCurrency(spent)} of {formatCurrency(budget.amount)}</div>
                      <div className={`text-xs ${status.color}`}>
                        {status.status}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {percentage.toFixed(1)}% used
                      </span>
                      <span className={percentage >= 100 ? 'text-red-500' : remaining > 0 ? 'text-green-500' : 'text-gray-500'}>
                        {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over budget`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
