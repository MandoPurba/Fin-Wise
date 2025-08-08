'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data - will be replaced with real data from Supabase
const mockStats = {
  totalBalance: 154205000, // IDR 154,205,000
  monthlyIncome: 52000000, // IDR 52,000,000
  monthlyExpenses: 38507500, // IDR 38,507,500
  savingsRate: 26.0,
}

const mockPreviousStats = {
  totalBalance: 142002500, // IDR 142,002,500
  monthlyIncome: 48000000, // IDR 48,000,000
  monthlyExpenses: 39000000, // IDR 39,000,000
  savingsRate: 18.8,
}

const mockChartData = [
  { date: '2024-01-01', income: 50000000, expenses: 32000000, balance: 120000000 },
  { date: '2024-01-15', income: 52000000, expenses: 34000000, balance: 138000000 },
  { date: '2024-02-01', income: 48000000, expenses: 36000000, balance: 150000000 },
  { date: '2024-02-15', income: 51000000, expenses: 33000000, balance: 168000000 },
  { date: '2024-03-01', income: 53000000, expenses: 35000000, balance: 186000000 },
  { date: '2024-03-15', income: 52000000, expenses: 38500000, balance: 199500000 },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your finances.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={mockStats} previousStats={mockPreviousStats} />

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <IncomeExpenseChart data={mockChartData} />
          
          {/* Recent Transactions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Indomaret</p>
                    <p className="text-sm text-muted-foreground">Food & Dining</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-Rp 85.500</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Gaji Bulanan</p>
                    <p className="text-sm text-muted-foreground">Income</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+Rp 26.000.000</p>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Listrik PLN</p>
                    <p className="text-sm text-muted-foreground">Utilities</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-Rp 1.200.000</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
