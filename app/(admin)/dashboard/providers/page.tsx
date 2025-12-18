'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Power, PowerOff } from 'lucide-react'
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

type Provider = {
  id: string
  name: string
  baseUrl: string | null
  models: string[]
  enabled: boolean
  inputPrice: number | null
  outputPrice: number | null
  createdAt: string
  updatedAt: string
}

type FormData = {
  name: string
  baseUrl: string
  apiKey: string
  models: string
  enabled: boolean
  inputPrice: string
  outputPrice: string
}

const initialFormData: FormData = {
  name: '',
  baseUrl: '',
  apiKey: '',
  models: '',
  enabled: true,
  inputPrice: '',
  outputPrice: ''
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Provider | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      const res = await fetch('/api/admin/providers')
      if (res.ok) {
        const data = await res.json()
        setProviders(data.providers)
      }
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: formData.name,
        baseUrl: formData.baseUrl || null,
        apiKey: formData.apiKey,
        models: formData.models.split(',').map(m => m.trim()).filter(Boolean),
        enabled: formData.enabled,
        inputPrice: formData.inputPrice ? parseFloat(formData.inputPrice) : null,
        outputPrice: formData.outputPrice ? parseFloat(formData.outputPrice) : null
      }

      const url = editing
        ? `/api/admin/providers/${editing.id}`
        : '/api/admin/providers'

      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowForm(false)
        setEditing(null)
        setFormData(initialFormData)
        loadProviders()
      }
    } catch (error) {
      console.error('Failed to save provider:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (provider: Provider) => {
    setEditing(provider)
    setFormData({
      name: provider.name,
      baseUrl: provider.baseUrl || '',
      apiKey: '',
      models: Array.isArray(provider.models) ? provider.models.join(', ') : '',
      enabled: provider.enabled,
      inputPrice: provider.inputPrice?.toString() || '',
      outputPrice: provider.outputPrice?.toString() || ''
    })
    setShowForm(true)
  }

  const handleToggle = async (provider: Provider) => {
    try {
      await fetch(`/api/admin/providers/${provider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !provider.enabled })
      })
      loadProviders()
    } catch (error) {
      console.error('Failed to toggle provider:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此服务商？')) return

    try {
      await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' })
      loadProviders()
    } catch (error) {
      console.error('Failed to delete provider:', error)
    }
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {editing ? '编辑服务商' : '添加服务商'}
          </h1>
          <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null) }}>
            取消
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">名称 *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如: OpenAI, Anthropic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base URL</label>
                  <Input
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    placeholder="如: https://api.openai.com/v1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  API Key {editing ? '(留空保持不变)' : '*'}
                </label>
                <Input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                  required={!editing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">支持的模型</label>
                <Input
                  value={formData.models}
                  onChange={(e) => setFormData({ ...formData, models: e.target.value })}
                  placeholder="gpt-4, gpt-3.5-turbo (逗号分隔)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">输入价格 ($/1K tokens)</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.inputPrice}
                    onChange={(e) => setFormData({ ...formData, inputPrice: e.target.value })}
                    placeholder="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">输出价格 ($/1K tokens)</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.outputPrice}
                    onChange={(e) => setFormData({ ...formData, outputPrice: e.target.value })}
                    placeholder="0.03"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="enabled" className="text-sm">启用此服务商</label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI 服务商配置</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> 添加服务商
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">服务商列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">暂无服务商，点击添加</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>Base URL</TableHead>
                  <TableHead>模型数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>价格 (输入/输出)</TableHead>
                  <TableHead className="w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map(provider => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {provider.baseUrl || '默认'}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(provider.models) ? provider.models.length : 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                        {provider.enabled ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      ${provider.inputPrice || '-'} / ${provider.outputPrice || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(provider)}
                          title={provider.enabled ? '禁用' : '启用'}
                        >
                          {provider.enabled ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(provider)}
                          title="编辑"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(provider.id)}
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
    </div>
  )
}
