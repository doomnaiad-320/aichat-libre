'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Badge } from '@/components/admin/ui/badge'
import { LorebookEntryForm } from '@/components/lorebook/lorebook-entry-form'
import {
  getAllLorebooks,
  createLorebook,
  deleteLorebook,
  addLorebookEntry,
  updateLorebookEntry,
  deleteLorebookEntry,
  toggleLorebookEntry,
  type LocalLorebook,
  type LorebookEntry
} from '@/lib/db/local'

type ViewMode = 'list' | 'create' | 'edit' | 'entry'

export default function LorebooksPage() {
  const [lorebooks, setLorebooks] = useState<LocalLorebook[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedLorebook, setSelectedLorebook] = useState<LocalLorebook | null>(null)
  const [editingEntry, setEditingEntry] = useState<LorebookEntry | null>(null)
  const [expandedLorebook, setExpandedLorebook] = useState<string | null>(null)
  const [lorebookName, setLorebookName] = useState('')

  useEffect(() => {
    loadLorebooks()
  }, [])

  const loadLorebooks = async () => {
    const data = await getAllLorebooks()
    setLorebooks(data)
  }

  const handleCreateLorebook = async () => {
    if (!lorebookName.trim()) return
    await createLorebook({ name: lorebookName, entries: [] })
    setLorebookName('')
    setViewMode('list')
    await loadLorebooks()
  }

  const handleDeleteLorebook = async (id: string) => {
    if (confirm('确定删除此世界书？所有条目将被删除。')) {
      await deleteLorebook(id)
      await loadLorebooks()
    }
  }

  const handleSaveEntry = async (data: Omit<LorebookEntry, 'id'>) => {
    if (!selectedLorebook) return

    if (editingEntry) {
      await updateLorebookEntry(selectedLorebook.id, editingEntry.id, data)
    } else {
      await addLorebookEntry(selectedLorebook.id, data)
    }

    setEditingEntry(null)
    setViewMode('list')
    await loadLorebooks()
  }

  const handleDeleteEntry = async (lorebookId: string, entryId: string) => {
    if (confirm('确定删除此条目？')) {
      await deleteLorebookEntry(lorebookId, entryId)
      await loadLorebooks()
    }
  }

  const handleToggleEntry = async (lorebookId: string, entryId: string) => {
    await toggleLorebookEntry(lorebookId, entryId)
    await loadLorebooks()
  }

  if (viewMode === 'create') {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-xl font-bold mb-4">创建世界书</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">名称 *</label>
            <Input
              value={lorebookName}
              onChange={e => setLorebookName(e.target.value)}
              placeholder="世界书名称"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setViewMode('list')}>取消</Button>
            <Button onClick={handleCreateLorebook} disabled={!lorebookName.trim()}>创建</Button>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'entry' && selectedLorebook) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-xl font-bold mb-4">
          {editingEntry ? '编辑条目' : '添加条目'} - {selectedLorebook.name}
        </h1>
        <LorebookEntryForm
          entry={editingEntry || undefined}
          onSave={handleSaveEntry}
          onCancel={() => { setEditingEntry(null); setViewMode('list') }}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">世界书</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理世界设定，当对话触发关键词时自动注入
          </p>
        </div>
        <Button onClick={() => setViewMode('create')}>
          <Plus className="h-4 w-4 mr-1" /> 创建世界书
        </Button>
      </div>

      {lorebooks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无世界书，点击创建开始
        </div>
      ) : (
        <div className="space-y-4">
          {lorebooks.map(lorebook => (
            <Card key={lorebook.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 cursor-pointer flex-1"
                    onClick={() => setExpandedLorebook(
                      expandedLorebook === lorebook.id ? null : lorebook.id
                    )}
                  >
                    {expandedLorebook === lorebook.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <CardTitle className="text-base">{lorebook.name}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {lorebook.entries.filter(e => e.enabled).length}/{lorebook.entries.length}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLorebook(lorebook)
                        setEditingEntry(null)
                        setViewMode('entry')
                      }}
                      title="添加条目"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLorebook(lorebook.id)}
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedLorebook === lorebook.id && (
                <CardContent>
                  {lorebook.entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      暂无条目
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {lorebook.entries.map(entry => (
                        <div
                          key={entry.id}
                          className={`p-3 border rounded-lg ${entry.enabled ? '' : 'opacity-50'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {entry.keys.map(key => (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}
                                  </Badge>
                                ))}
                                <span className="text-xs text-muted-foreground">
                                  优先级: {entry.priority}
                                </span>
                              </div>
                              <p className="text-sm mt-2 line-clamp-2">{entry.content}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleEntry(lorebook.id, entry.id)}
                                title={entry.enabled ? '禁用' : '启用'}
                              >
                                {entry.enabled ? (
                                  <Power className="h-3 w-3" />
                                ) : (
                                  <PowerOff className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLorebook(lorebook)
                                  setEditingEntry(entry)
                                  setViewMode('entry')
                                }}
                                title="编辑"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(lorebook.id, entry.id)}
                                title="删除"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
