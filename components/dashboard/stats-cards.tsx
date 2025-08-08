'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, calculatePercentageChange } from '@/lib/utils'
import { DashboardStats } from '@/types'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, CreditCard } from 'lucide-react'

interface StatsCardsProps {
  stats: DashboardStats
  previousStats?: DashboardStats
}

export function StatsCards({ stats, previousStats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Balance',
      value: stats.totalBalance,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Income',
      value: stats.monthlyIncome,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Monthly Expenses',
      value: stats.monthlyExpenses,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Savings Rate',
      value: stats.savingsRate,
      icon: PiggyBank,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isPercentage: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const previousValue = previousStats
          ? card.title === 'Total Balance'
            ? previousStats.totalBalance
            : card.title === 'Monthly Income'
            ? previousStats.monthlyIncome
            : card.title === 'Monthly Expenses'
            ? previousStats.monthlyExpenses
            : previousStats.savingsRate
          : undefined

        const percentageChange = previousValue
          ? calculatePercentageChange(card.value, previousValue)
          : undefined

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-full p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.isPercentage
                  ? `${card.value.toFixed(1)}%`
                  : formatCurrency(card.value)}
              </div>
              {percentageChange !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground">
                  {percentageChange > 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={
                      percentageChange > 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {Math.abs(percentageChange).toFixed(1)}%
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
