'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin/ui/table'

type Transaction = {
  id: string
  userId: string
  user: {
    name: string | null
    email: string
  }
  type: string
  amount: number
  balance: number
  description: string | null
  createdAt: string
}

type BillingStats = {
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  totalRevenue: number
  subscriptions: {
    free: number
    pro: number
    premium: number
  }
  recentTransactions: Transaction[]
}

export default function BillingPage() {
  const [stats, setStats] = useState<BillingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats({
          todayRevenue: data.overview?.todayRevenue || 0,
          weekRevenue: 0,
          monthRevenue: data.overview?.monthRevenue || 0,
          totalRevenue: 0,
          subscriptions: {
            free: 0,
            pro: 0,
            premium: 0
          },
          recentTransactions: []
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  const transactionTypes: Record<string, string> = {
    SPEND: '消费',
    REFUND: '退款',
    PURCHASE: '购买',
    SUBSCRIBE: '订阅',
    GRANT: '赠送'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">计费统计</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">今日收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.todayRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本周收入</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.weekRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月收入</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.monthRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">tokens</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            订阅分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats?.subscriptions?.free || 0}</p>
              <p className="text-sm text-muted-foreground">免费版</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.subscriptions?.pro || 0}</p>
              <p className="text-sm text-muted-foreground">专业版</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats?.subscriptions?.premium || 0}</p>
              <p className="text-sm text-muted-foreground">高级版</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近交易</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              暂无交易记录
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>余额</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm">{tx.user?.name || '未设置'}</p>
                        <p className="text-xs text-muted-foreground">{tx.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{transactionTypes[tx.type] || tx.type}</TableCell>
                    <TableCell className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{tx.balance.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.description || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(tx.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
