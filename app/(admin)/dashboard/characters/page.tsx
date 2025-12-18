'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Eye, EyeOff, Trash2, Globe, Lock, Link as LinkIcon } from 'lucide-react'
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

type Character = {
  id: string
  name: string
  description: string | null
  tags: string[] | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  likes: number
  downloads: number
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visibility, setVisibility] = useState('')
  const [sort, setSort] = useState('latest')

  const loadCharacters = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sort
      })
      if (search) params.set('search', search)
      if (visibility) params.set('visibility', visibility)

      const res = await fetch(`/api/admin/characters?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCharacters(data.characters)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to load characters:', error)
    } finally {
      setLoading(false)
    }
  }, [search, visibility, sort])

  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadCharacters(1)
  }

  const handleUpdateVisibility = async (id: string, newVisibility: string) => {
    try {
      const res = await fetch(`/api/admin/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility })
      })
      if (res.ok) {
        loadCharacters(pagination?.page || 1)
      }
    } catch (error) {
      console.error('Failed to update visibility:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此角色卡？')) return

    try {
      const res = await fetch(`/api/admin/characters/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        loadCharacters(pagination?.page || 1)
      }
    } catch (error) {
      console.error('Failed to delete character:', error)
    }
  }

  const visibilityIcons: Record<string, React.ReactNode> = {
    PUBLIC: <Globe className="h-3 w-3" />,
    PRIVATE: <Lock className="h-3 w-3" />,
    UNLISTED: <LinkIcon className="h-3 w-3" />
  }

  const visibilityLabels: Record<string, string> = {
    PUBLIC: '公开',
    PRIVATE: '私有',
    UNLISTED: '未列出'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">角色卡审核</h1>
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
                  placeholder="搜索角色卡名称..."
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">全部可见性</option>
              <option value="PUBLIC">公开</option>
              <option value="PRIVATE">私有</option>
              <option value="UNLISTED">未列出</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="latest">最新</option>
              <option value="likes">最多点赞</option>
              <option value="downloads">最多下载</option>
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
                  <TableHead>角色卡</TableHead>
                  <TableHead>创作者</TableHead>
                  <TableHead>可见性</TableHead>
                  <TableHead>点赞</TableHead>
                  <TableHead>下载</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map(char => (
                  <TableRow key={char.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{char.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {char.description || '暂无描述'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{char.user.name || '未设置'}</p>
                        <p className="text-xs text-muted-foreground">{char.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={char.visibility === 'PUBLIC' ? 'default' : 'secondary'}>
                        {visibilityIcons[char.visibility]}
                        <span className="ml-1">{visibilityLabels[char.visibility]}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{char.likes}</TableCell>
                    <TableCell>{char.downloads}</TableCell>
                    <TableCell>
                      {new Date(char.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {char.visibility === 'PUBLIC' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateVisibility(char.id, 'PRIVATE')}
                            title="设为私有"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateVisibility(char.id, 'PUBLIC')}
                            title="设为公开"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(char.id)}
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
            onClick={() => loadCharacters(pagination.page - 1)}
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
            onClick={() => loadCharacters(pagination.page + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
