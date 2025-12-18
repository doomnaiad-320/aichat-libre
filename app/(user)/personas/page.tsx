'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { PersonaCard } from '@/components/personas/persona-card'
import { PersonaForm } from '@/components/personas/persona-form'
import {
  getAllPersonas,
  createPersona,
  updatePersona,
  deletePersona,
  setDefaultPersona,
  type LocalPersona
} from '@/lib/db/local'

export default function PersonasPage() {
  const [personas, setPersonas] = useState<LocalPersona[]>([])
  const [editing, setEditing] = useState<LocalPersona | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    getAllPersonas().then(setPersonas)
  }, [])

  const handleSave = async (data: Partial<LocalPersona>) => {
    if (editing) {
      await updatePersona(editing.id, data)
    } else {
      await createPersona(data as Omit<LocalPersona, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setPersonas(await getAllPersonas())
    setEditing(null)
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定删除此人设？')) {
      await deletePersona(id)
      setPersonas(await getAllPersonas())
    }
  }

  const handleSetDefault = async (id: string) => {
    await setDefaultPersona(id)
    setPersonas(await getAllPersonas())
  }

  if (isCreating || editing) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-xl font-bold mb-4">{editing ? '编辑人设' : '创建人设'}</h1>
        <PersonaForm
          persona={editing || undefined}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setIsCreating(false) }}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">我的人设</h1>
          <p className="text-sm text-muted-foreground mt-1">
            创建人设来代表你在对话中的身份
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-1" /> 创建人设
        </Button>
      </div>

      {personas.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无人设，点击创建开始
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map(persona => (
            <div key={persona.id} className="relative group">
              <PersonaCard persona={persona} onClick={() => setEditing(persona)} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                {!persona.isDefault && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(persona.id) }}
                    title="设为默认"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setEditing(persona) }}
                  title="编辑"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(persona.id) }}
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
