'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MessageCircle, Pencil, Trash2, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { CharacterCard } from '@/components/characters/character-card'
import { CharacterForm } from '@/components/characters/character-form'
import { CharacterImport } from '@/components/characters/character-import'
import {
  getAllCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  type LocalCharacter
} from '@/lib/db/local'
import {
  exportCharacterAsPNG,
  type CharacterCardV2
} from '@/lib/utils/character-card'

function toCharacterCard(char: LocalCharacter): CharacterCardV2 {
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: char.name,
      description: char.description,
      personality: char.personality,
      scenario: char.scenario,
      first_mes: char.firstMessage,
      mes_example: char.exampleDialogue,
      tags: char.tags,
      creator: 'AIChatLibre',
      character_version: '1.0',
    }
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function CharactersPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<LocalCharacter[]>([])
  const [editing, setEditing] = useState<LocalCharacter | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    getAllCharacters().then(setCharacters)
  }, [])

  const handleSave = async (data: Partial<LocalCharacter>) => {
    if (editing) {
      await updateCharacter(editing.id, data)
    } else {
      await createCharacter(data as Omit<LocalCharacter, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setCharacters(await getAllCharacters())
    setEditing(null)
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定删除此角色卡？')) {
      await deleteCharacter(id)
      setCharacters(await getAllCharacters())
    }
  }

  const handleChat = (id: string) => {
    router.push(`/chat/${id}`)
  }

  const handleImport = async (card: CharacterCardV2) => {
    await createCharacter({
      name: card.data.name,
      description: card.data.description,
      personality: card.data.personality,
      scenario: card.data.scenario,
      firstMessage: card.data.first_mes,
      exampleDialogue: card.data.mes_example,
      tags: card.data.tags,
      cardData: card as unknown as Record<string, unknown>,
    })
    setCharacters(await getAllCharacters())
  }

  const handleExportPNG = async (char: LocalCharacter) => {
    const card = toCharacterCard(char)
    const blob = await exportCharacterAsPNG(card, char.avatar)
    downloadBlob(blob, `${char.name}.png`)
  }

  const handlePublish = async (char: LocalCharacter) => {
    if (!confirm('确定将此角色卡发布到社区？')) return

    try {
      const cardData = char.cardData || toCharacterCard(char)
      const res = await fetch('/api/community/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: char.name,
          description: char.description,
          tags: char.tags,
          cardData,
          visibility: 'PUBLIC'
        })
      })

      if (res.ok) {
        alert('角色卡已发布到社区!')
      } else {
        const data = await res.json()
        alert(`发布失败: ${data.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Publish error:', error)
      alert('发布失败，请稍后重试')
    }
  }

  if (isCreating || editing) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-xl font-bold mb-4">{editing ? '编辑角色' : '创建角色'}</h1>
        <CharacterForm
          character={editing || undefined}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setIsCreating(false) }}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">角色卡</h1>
        <div className="flex gap-2">
          <CharacterImport onImport={handleImport} />
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> 创建
          </Button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无角色卡，点击创建或导入开始
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map(char => (
            <div key={char.id} className="relative group">
              <CharacterCard character={char} onClick={() => handleChat(char.id)} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleChat(char.id) }}
                  title="聊天"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setEditing(char) }}
                  title="编辑"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleExportPNG(char) }}
                  title="导出PNG"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handlePublish(char) }}
                  title="发布到社区"
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(char.id) }}
                  title="删除"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
