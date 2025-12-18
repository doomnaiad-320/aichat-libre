'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { CharacterCard } from '@/components/characters/character-card'
import { CharacterForm } from '@/components/characters/character-form'
import {
  getAllCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  type LocalCharacter
} from '@/lib/db/local'

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
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-1" /> 创建
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无角色卡，点击创建开始
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
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setEditing(char) }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(char.id) }}
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
