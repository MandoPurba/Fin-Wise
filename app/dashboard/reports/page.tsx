'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Calendar, TrendingUp, PieChart, BarChart3 } from 'lucide-react'

const reportTypes = [
  {
    title: 'Laporan Keuangan Bulanan',
    description: 'Gambaran lengkap pendapatan, pengeluaran, dan kekayaan bersih',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600',
    lastGenerated: '2 hari yang lalu',
  },
  {
    title: 'Laporan Pengeluaran',
    description: 'Kategorisasi detail semua pengeluaran',
    icon: PieChart,
    color: 'bg-red-50 text-red-600',
    lastGenerated: '1 minggu yang lalu',
  },
  {
    title: 'Analisis Pendapatan',
    description: 'Lacak sumber pendapatan dan tren pertumbuhan',
    icon: TrendingUp,
    color: 'bg-green-50 text-green-600',
    lastGenerated: '3 hari yang lalu',
  },
  {
    title: 'Laporan Pajak',
    description: 'Laporan terformat untuk keperluan pajak',
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600',
    lastGenerated: '1 bulan yang lalu',
  },
]

const recentReports = [
  { name: 'Laporan Januari 2024.pdf', type: 'Laporan Bulanan', date: '2024-02-01', size: '2.3 MB' },
  { name: 'Laporan Pajak Q4 2023.pdf', type: 'Laporan Pajak', date: '2024-01-15', size: '1.8 MB' },
  { name: 'Pengeluaran Desember.csv', type: 'Laporan Pengeluaran', date: '2024-01-01', size: '156 KB' },
  { name: 'Ringkasan Akhir Tahun 2023.pdf', type: 'Laporan Tahunan', date: '2023-12-31', size: '3.1 MB' },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Laporan</h1>
        <p className="text-text-secondary">
          Generate laporan keuangan detail dan ekspor data Anda.
        </p>
      </div>

      {/* Report Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <Card key={report.title} className="bg-surface-1 border-surface-border hover:bg-surface-2 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <div className={`rounded-full p-3 mx-auto w-fit ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-base text-text-primary">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-sm text-text-secondary">{report.description}</p>
              <p className="text-xs text-text-muted">
                Terakhir dibuat: {report.lastGenerated}
              </p>
              <Button size="sm" className="w-full bg-accent text-base hover:bg-accent/90">
                Buat Laporan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card className="bg-surface-1 border-surface-border">
          <CardHeader>
            <CardTitle className="text-text-primary">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-surface-border text-text-primary hover:bg-surface-2">
              <Calendar className="mr-2 h-4 w-4" />
              Buat Laporan Periode Kustom
            </Button>
            <Button variant="outline" className="w-full justify-start border-surface-border text-text-primary hover:bg-surface-2">
              <Download className="mr-2 h-4 w-4" />
              Ekspor Semua Data (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start border-surface-border text-text-primary hover:bg-surface-2">
              <FileText className="mr-2 h-4 w-4" />
              Jadwalkan Laporan Otomatis
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="bg-surface-1 border-surface-border">
          <CardHeader>
            <CardTitle className="text-text-primary">Laporan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-surface-border rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-text-secondary" />
                    <div>
                      <p className="font-medium text-sm text-text-primary">{report.name}</p>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Badge variant="outline" className="text-xs border-surface-border">
                          {report.type}
                        </Badge>
                        <span>•</span>
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <Card className="bg-surface-1 border-surface-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Analitik Pembuatan Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">24</div>
              <p className="text-sm text-text-secondary">Laporan Dibuat Bulan Ini</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">156 MB</div>
              <p className="text-sm text-text-secondary">Total Ukuran yang Diunduh</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">8</div>
              <p className="text-sm text-text-secondary">Laporan Terjadwal Aktif</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
