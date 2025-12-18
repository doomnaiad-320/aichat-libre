'use client'

import { useState } from 'react'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import type { LorebookEntry } from '@/lib/db/local'

type Props = {
  entry?: LorebookEntry
  onSave: (data: Omit<LorebookEntry, 'id'>) => void
  onCancel: () => void
}

export function LorebookEntryForm({ entry, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    keys: entry?.keys.join(', ') || '',
    content: entry?.content || '',
    enabled: entry?.enabled ?? true,
    priority: entry?.priority ?? 50,
    position: entry?.position || 'before_char'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      keys: form.keys.split(',').map(k => k.trim()).filter(Boolean),
      content: form.content,
      enabled: form.enabled,
      priority: form.priority,
      position: form.position
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">关键词 (逗号分隔) *</label>
        <Input
          value={form.keys}
          onChange={e => setForm(f => ({ ...f, keys: e.target.value }))}
          placeholder="魔法, magic, 咒语"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          当对话中出现这些词时会触发此条目
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">内容 *</label>
        <textarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]"
          placeholder="描述这个世界设定的详细信息..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">优先级</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 50 }))}
          />
          <p className="text-xs text-muted-foreground mt-1">0-100，数值越高优先级越高</p>
        </div>

        <div>
          <label className="text-sm font-medium">插入位置</label>
          <select
            value={form.position}
            onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="before_char">角色设定之前</option>
            <option value="after_char">角色设定之后</option>
            <option value="before_example">示例对话之前</option>
            <option value="after_example">示例对话之后</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={form.enabled}
          onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
          className="rounded border-input"
        />
        <label htmlFor="enabled" className="text-sm">启用此条目</label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={!form.keys || !form.content}>保存</Button>
      </div>
    </form>
  )
}
