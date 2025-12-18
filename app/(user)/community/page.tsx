'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Heart, Download, TrendingUp, Clock, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/admin/ui/card'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import Link from 'next/link'

type CommunityCharacter = {
  id: string
  name: string
  description: string | null
  tags: string[] | null
  likes: number
  downloads: number
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

type SortType = 'latest' | 'popular' | 'downloads'

export default function CommunityPage() {
  const [characters, setCharacters] = useState<CommunityCharacter[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortType>('latest')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const loadCharacters = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sort
      })
      if (search) params.set('search', search)
      if (selectedTag) params.set('tag', selectedTag)

      const res = await fetch(`/api/community/characters?${params}`)
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
  }, [search, sort, selectedTag])

  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadCharacters(1)
  }

  const popularTags = ['Fantasy', 'Romance', 'Sci-Fi', 'Anime', 'Game', 'Original', 'Historical']

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold mb-4">角色社区</h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索角色..."
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              搜索
            </Button>
          </form>

          <div className="flex gap-2">
            <Button
              variant={sort === 'latest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSort('latest')}
            >
              <Clock className="h-4 w-4 mr-1" />
              最新
            </Button>
            <Button
              variant={sort === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSort('popular')}
            >
              <Heart className="h-4 w-4 mr-1" />
              热门
            </Button>
            <Button
              variant={sort === 'downloads' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSort('downloads')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              下载
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground mt-1" />
          {popularTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Character Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : characters.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">暂无角色卡</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {characters.map(character => (
                <Link key={character.id} href={`/community/${character.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-primary">
                            {character.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{character.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {character.description || '暂无描述'}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      {character.tags && character.tags.length > 0 && (
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {character.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {character.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{character.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {character.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {character.downloads}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {character.user.image && (
                            <img
                              src={character.user.image}
                              alt={character.user.name || ''}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {character.user.name || '匿名'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
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
          </>
        )}
      </div>
    </div>
  )
}
