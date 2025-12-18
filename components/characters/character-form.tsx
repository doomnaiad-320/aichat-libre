'use client'

import { useState } from 'react'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import type { LocalCharacter } from '@/lib/db/local'

type Props = {
  character?: LocalCharacter
  onSave: (data: Partial<LocalCharacter>) => void
  onCancel: () => void
}

export function CharacterForm({ character, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    name: character?.name || '',
    description: character?.description || '',
    personality: character?.personality || '',
    scenario: character?.scenario || '',
    firstMessage: character?.firstMessage || '',
    tags: character?.tags?.join(', ') || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">名称 *</label>
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">描述</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="text-sm font-medium">性格</label>
        <textarea
          value={form.personality}
          onChange={e => setForm(f => ({ ...f, personality: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="text-sm font-medium">场景设定</label>
        <textarea
          value={form.scenario}
          onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-medium">开场白</label>
        <textarea
          value={form.firstMessage}
          onChange={e => setForm(f => ({ ...f, firstMessage: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="text-sm font-medium">标签 (逗号分隔)</label>
        <Input
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="fantasy, romance"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={!form.name}>保存</Button>
      </div>
    </form>
  )
}
