'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/admin/ui/card'

type Stats = {
  overview: {
    totalUsers: number
    todayUsers: number
    totalCharacters: number
    publicCharacters: number
    todayRevenue: number
    todayTransactionCount: number
    monthRevenue: number
    monthTransactionCount: number
  }
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    image: string | null
    plan: string
    createdAt: string
  }>
  dailyStats: Array<{
    date: string
    users: number
    revenue: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
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

  const overview = stats?.overview

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview?.totalUsers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              今日新增 +{overview?.todayUsers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">角色卡总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview?.totalCharacters || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              公开 {overview?.publicCharacters || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">今日收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview?.todayRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.todayTransactionCount || 0} 笔交易
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月收入</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview?.monthRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.monthTransactionCount || 0} 笔交易
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表和最近用户 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">7日趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.dailyStats.map(day => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="w-20 text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((day.users / Math.max(...stats.dailyStats.map(d => d.users), 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground">{day.users}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  暂无数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 最近注册用户 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近注册</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-sm font-medium">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || '未设置昵称'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  暂无用户
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
