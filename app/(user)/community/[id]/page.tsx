'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Download, ArrowLeft, User, Calendar, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { createCharacter } from '@/lib/db/local/characters'
import type { CharacterCardV2 } from '@/lib/utils/character-card'

type CharacterDetail = {
  id: string
  name: string
  description: string | null
  tags: string[] | null
  cardData: CharacterCardV2
  likes: number
  downloads: number
  visibility: string
  createdAt: string
  updatedAt: string
  isLiked: boolean
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export default function CommunityCharacterDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [character, setCharacter] = useState<CharacterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadCharacter()
  }, [id])

  const loadCharacter = async () => {
    try {
      const res = await fetch(`/api/community/characters/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCharacter(data.character)
      } else {
        router.push('/community')
      }
    } catch (error) {
      console.error('Failed to load character:', error)
      router.push('/community')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!character || liking) return
    setLiking(true)
    try {
      const res = await fetch(`/api/community/characters/${id}/like`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()
        setCharacter({
          ...character,
          likes: data.likes,
          isLiked: data.liked
        })
      }
    } catch (error) {
      console.error('Failed to like:', error)
    } finally {
      setLiking(false)
    }
  }

  const handleDownload = async () => {
    if (!character || downloading) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/community/characters/${id}/download`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()

        // 保存到本地数据库
        await createCharacter({
          name: data.character.name,
          description: data.character.description || '',
          cardData: data.character.cardData,
          tags: character.tags || []
        })

        setCharacter({
          ...character,
          downloads: data.downloads
        })

        alert('角色卡已下载到本地!')
      }
    } catch (error) {
      console.error('Failed to download:', error)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (!character) {
    return null
  }

  const cardData = character.cardData

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
            <span className="text-5xl font-bold text-primary">
              {character.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{character.name}</h1>
            <p className="text-muted-foreground mt-2">
              {character.description || '暂无描述'}
            </p>

            {/* Tags */}
            {character.tags && character.tags.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {character.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {character.user.image && (
                  <img
                    src={character.user.image}
                    alt={character.user.name || ''}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <User className="h-4 w-4" />
                <span>{character.user.name || '匿名'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(character.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant={character.isLiked ? 'default' : 'outline'}
                onClick={handleLike}
                disabled={liking}
              >
                <Heart className={`h-4 w-4 mr-2 ${character.isLiked ? 'fill-current' : ''}`} />
                {character.likes} 点赞
              </Button>
              <Button onClick={handleDownload} disabled={downloading}>
                <Download className="h-4 w-4 mr-2" />
                {downloading ? '下载中...' : `下载 (${character.downloads})`}
              </Button>
            </div>
          </div>
        </div>

        {/* Character Card Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">名称:</span>
                <span className="ml-2">{cardData.data?.name || character.name}</span>
              </div>
              {cardData.data?.creator && (
                <div>
                  <span className="text-muted-foreground">创作者:</span>
                  <span className="ml-2">{cardData.data.creator}</span>
                </div>
              )}
              {cardData.data?.character_version && (
                <div>
                  <span className="text-muted-foreground">版本:</span>
                  <span className="ml-2">{cardData.data.character_version}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">统计信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">描述长度:</span>
                <span className="ml-2">{cardData.data?.description?.length || 0} 字符</span>
              </div>
              <div>
                <span className="text-muted-foreground">人设长度:</span>
                <span className="ml-2">{cardData.data?.personality?.length || 0} 字符</span>
              </div>
              <div>
                <span className="text-muted-foreground">示例对话:</span>
                <span className="ml-2">{cardData.data?.mes_example?.length || 0} 字符</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {cardData.data?.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">角色描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{cardData.data.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Personality */}
        {cardData.data?.personality && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">性格特征</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{cardData.data.personality}</p>
            </CardContent>
          </Card>
        )}

        {/* First Message */}
        {cardData.data?.first_mes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">开场白</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{cardData.data.first_mes}</p>
            </CardContent>
          </Card>
        )}

        {/* Scenario */}
        {cardData.data?.scenario && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">场景设定</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{cardData.data.scenario}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
