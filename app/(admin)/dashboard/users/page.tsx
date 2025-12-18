'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MoreHorizontal, Shield, User as UserIcon, Ban } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import { Badge } from '@/components/admin/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin/ui/table'
import Link from 'next/link'

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'USER' | 'ADMIN'
  plan: 'FREE' | 'PRO' | 'PREMIUM'
  balance: number
  createdAt: string
  _count: {
    characters: number
    transactions: number
  }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20'
      })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      if (planFilter) params.set('plan', planFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, planFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers(1)
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      if (res.ok) {
        loadUsers(pagination?.page || 1)
      }
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const planColors: Record<string, string> = {
    FREE: 'secondary',
    PRO: 'default',
    PREMIUM: 'destructive'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索用户名或邮箱..."
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">全部角色</option>
              <option value="USER">普通用户</option>
              <option value="ADMIN">管理员</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">全部计划</option>
              <option value="FREE">免费版</option>
              <option value="PRO">专业版</option>
              <option value="PREMIUM">高级版</option>
            </select>
            <Button type="submit">搜索</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>计划</TableHead>
                  <TableHead>余额</TableHead>
                  <TableHead>角色卡</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-sm font-medium">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || '未设置'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? (
                          <><Shield className="h-3 w-3 mr-1" />管理员</>
                        ) : (
                          <><UserIcon className="h-3 w-3 mr-1" />用户</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={planColors[user.plan] as 'default' | 'secondary' | 'destructive'}>
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.balance.toLocaleString()}</TableCell>
                    <TableCell>{user._count.characters}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/users/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
                        {user.role !== 'ADMIN' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateRole(user.id, 'ADMIN')}
                            title="设为管理员"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateRole(user.id, 'USER')}
                            title="取消管理员"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => loadUsers(pagination.page - 1)}
          >
            上一页
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadUsers(pagination.page + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
