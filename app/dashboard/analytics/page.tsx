'use client'

import React, { useState, useEffect } from 'react'
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart'
import { ExpenseByCategoryChart, MonthlySpendingChart } from '@/components/charts/category-charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react'
import { getColorStyles, formatCurrency } from '@/lib/utils'
import { DashboardService, AuthService } from '@/lib/supabase'

interface AnalyticsData {
  chartData: Array<{ date: string; income: number; expenses: number; balance: number }>
  categoryData: Array<{ category: string; amount: number; percentage: number; color: string }>
  monthlyData: Array<{ month: string; amount: number }>
  insights: Array<{
    title: string
    value: string
    amount?: string
    trend: 'up' | 'down'
    change: string
    description: string
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const user = await AuthService.getCurrentUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        const dashboardStats = await DashboardService.getDashboardStats(user.id)
        const chartData = await DashboardService.getChartData(user.id, 6)
        const categoryExpenses = await DashboardService.getCategoryExpenses(user.id, 1)
        
        // Transform data for analytics
        const formattedChartData = chartData.map(item => ({
          date: `${item.date}-01`,
          income: item.income,
          expenses: item.expenses,
          balance: item.balance
        }))

        const categoryData = categoryExpenses.map((cat, index) => ({
          category: cat.category,
          amount: cat.amount,
          percentage: cat.percentage,
          color: cat.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate colors if not provided
        }))

        const monthlyData = chartData.slice(-6).map(item => ({
          month: new Date(item.date + '-01').toLocaleDateString('en', { month: 'short' }),
          amount: item.expenses
        }))

        // Generate insights
        const totalIncome = chartData.reduce((sum: number, item: any) => sum + item.income, 0)
        const totalExpenses = chartData.reduce((sum: number, item: any) => sum + item.expenses, 0)
        const currentMonth = chartData[chartData.length - 1]
        const previousMonth = chartData[chartData.length - 2]
        
        const insights = [
          {
            title: 'Highest Spending Category',
            value: categoryData[0]?.category || 'N/A',
            amount: formatCurrency(categoryData[0]?.amount || 0),
            trend: 'up' as const,
            change: `${categoryData[0]?.percentage.toFixed(1) || 0}%`,
            description: 'of total expenses',
          },
          {
            title: 'Monthly Savings',
            value: formatCurrency(currentMonth ? currentMonth.income - currentMonth.expenses : 0),
            amount: '',
            trend: currentMonth && previousMonth 
              ? (currentMonth.income - currentMonth.expenses) > (previousMonth.income - previousMonth.expenses) 
                ? 'up' as const 
                : 'down' as const
              : 'up' as const,
            change: currentMonth && previousMonth 
              ? `${Math.round(((currentMonth.income - currentMonth.expenses) - (previousMonth.income - previousMonth.expenses)) / (previousMonth.income - previousMonth.expenses || 1) * 100)}%`
              : '0%',
            description: 'vs last month',
          },
          {
            title: 'Total Income',
            value: formatCurrency(totalIncome),
            amount: '',
            trend: 'up' as const,
            change: '+15%',
            description: 'this period',
          },
          {
            title: 'Total Expenses',
            value: formatCurrency(totalExpenses),
            amount: '',
            trend: currentMonth && previousMonth 
              ? currentMonth.expenses > previousMonth.expenses 
                ? 'up' as const 
                : 'down' as const
              : 'up' as const,
            change: currentMonth && previousMonth 
              ? `${Math.round((currentMonth.expenses - previousMonth.expenses) / (previousMonth.expenses || 1) * 100)}%`
              : '0%',
            description: 'vs last month',
          },
        ]

        setAnalyticsData({
          chartData: formattedChartData,
          categoryData,
          monthlyData,
          insights
        })
      } catch (err) {
        console.error('Error loading analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Key Insights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your financial patterns and trends.
          </p>
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

  if (!analyticsData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into your financial patterns and trends.
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsData.insights.map((insight) => (
          <Card key={insight.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{insight.value}</div>
                {insight.amount && (
                  <div className="text-lg text-muted-foreground">{insight.amount}</div>
                )}
                <div className="flex items-center gap-1 text-xs">
                  {insight.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <Badge
                    variant="outline"
                    className={insight.trend === 'up' ? 'text-green-600' : 'text-red-600'}
                  >
                    {insight.change}
                  </Badge>
                  <span className="text-muted-foreground">{insight.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {analyticsData.chartData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <IncomeExpenseChart data={analyticsData.chartData} />
          {analyticsData.categoryData.length > 0 && (
            <ExpenseByCategoryChart data={analyticsData.categoryData} />
          )}
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed border-2">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground">
            Start adding transactions to see your analytics
          </p>
        </Card>
      )}

      {analyticsData.monthlyData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <MonthlySpendingChart data={analyticsData.monthlyData} />
          
          {/* Top Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.categoryData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <p>No category data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.categoryData.slice(0, 5).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
