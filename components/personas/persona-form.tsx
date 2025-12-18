'use client'

import { useState } from 'react'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import type { LocalPersona } from '@/lib/db/local'

type Props = {
  persona?: LocalPersona
  onSave: (data: Partial<LocalPersona>) => void
  onCancel: () => void
}

export function PersonaForm({ persona, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    name: persona?.name || '',
    description: persona?.description || '',
    personality: persona?.personality || '',
    background: persona?.background || '',
    isDefault: persona?.isDefault || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">名称 *</label>
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="你的名字/昵称"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">简介</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={2}
          placeholder="简单介绍一下自己..."
        />
      </div>
      <div>
        <label className="text-sm font-medium">性格特点</label>
        <textarea
          value={form.personality}
          onChange={e => setForm(f => ({ ...f, personality: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
          placeholder="描述你的性格特点，如：开朗、内向、幽默..."
        />
      </div>
      <div>
        <label className="text-sm font-medium">背景故事</label>
        <textarea
          value={form.background}
          onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
          placeholder="你的背景、职业、爱好等..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={form.isDefault}
          onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
          className="rounded border-input"
        />
        <label htmlFor="isDefault" className="text-sm">设为默认人设</label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={!form.name}>保存</Button>
      </div>
    </form>
  )
}
