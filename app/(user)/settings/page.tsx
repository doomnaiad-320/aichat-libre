'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, Upload, AlertTriangle, Database, Lock, Unlock, Shield } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/admin/ui/card'
import {
  getAIProviders,
  saveAIProviders,
  getDefaultProvider,
  setDefaultProvider,
  type AIProviderConfig
} from '@/lib/db/local'
import {
  exportAllData,
  downloadExportData,
  getExportStats,
  exportDataToJSON
} from '@/lib/db/local/export'
import {
  importAllData,
  clearAllData,
  parseImportData,
  type ImportResult
} from '@/lib/db/local/import'
import {
  encryptExportData,
  decryptImportData,
  isImportDataEncrypted
} from '@/lib/db/local/encryption'

const PROVIDER_PRESETS = {
  openai: { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  anthropic: { name: 'Anthropic', baseURL: 'https://api.anthropic.com', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  deepseek: { name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-coder'] },
  siliconflow: { name: '硅基流动', baseURL: 'https://api.siliconflow.cn/v1', models: ['Qwen/Qwen2.5-72B-Instruct'] },
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<AIProviderConfig[]>([])
  const [defaultProv, setDefaultProv] = useState<{ provider: string; model: string } | null>(null)
  const [stats, setStats] = useState<{ characters: number; chats: number; messages: number; lorebooks: number; personas: number } | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [encryptExport, setEncryptExport] = useState(false)
  const [exportPassword, setExportPassword] = useState('')
  const [importPassword, setImportPassword] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAIProviders().then(setProviders)
    getDefaultProvider().then(setDefaultProv)
    loadStats()
  }, [])

  const loadStats = async () => {
    const s = await getExportStats()
    setStats(s)
  }

  const addProvider = (type: keyof typeof PROVIDER_PRESETS) => {
    const preset = PROVIDER_PRESETS[type]
    const newProvider: AIProviderConfig = {
      id: Date.now().toString(),
      name: preset.name,
      type,
      apiKey: '',
      baseURL: preset.baseURL,
      models: preset.models,
      enabled: true
    }
    const updated = [...providers, newProvider]
    setProviders(updated)
    saveAIProviders(updated)
  }

  const updateProvider = (id: string, data: Partial<AIProviderConfig>) => {
    const updated = providers.map(p => p.id === id ? { ...p, ...data } : p)
    setProviders(updated)
    saveAIProviders(updated)
  }

  const removeProvider = (id: string) => {
    const updated = providers.filter(p => p.id !== id)
    setProviders(updated)
    saveAIProviders(updated)
  }

  const handleSetDefault = (providerId: string, model: string) => {
    setDefaultProv({ provider: providerId, model })
    setDefaultProvider(providerId, model)
  }

  const handleExport = async () => {
    if (encryptExport && !exportPassword) {
      alert('请输入加密密码')
      return
    }

    setExporting(true)
    try {
      const data = await exportAllData()

      if (encryptExport && exportPassword) {
        // 加密导出
        const jsonData = exportDataToJSON(data)
        const encryptedData = await encryptExportData(jsonData, exportPassword)
        const blob = new Blob([encryptedData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `aichat-libre-backup-encrypted-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setExportPassword('')
      } else {
        downloadExportData(data)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 先读取文件内容检查是否加密
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string

      if (isImportDataEncrypted(content)) {
        // 文件已加密，需要密码
        setPendingImportFile(file)
        setShowPasswordDialog(true)
      } else {
        // 未加密文件，直接导入
        await processImport(file, null)
      }
    }
    reader.readAsText(file)
  }

  const handlePasswordSubmit = async () => {
    if (!pendingImportFile || !importPassword) {
      alert('请输入解密密码')
      return
    }

    await processImport(pendingImportFile, importPassword)
    setShowPasswordDialog(false)
    setPendingImportFile(null)
    setImportPassword('')
  }

  const processImport = async (file: File, password: string | null) => {
    setImporting(true)
    setImportResult(null)

    try {
      const reader = new FileReader()
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      })

      let jsonData = content
      if (password) {
        // 解密数据
        try {
          jsonData = await decryptImportData(content, password)
        } catch {
          alert('解密失败，密码可能不正确')
          setImporting(false)
          return
        }
      }

      const data = parseImportData(jsonData)
      if (!data) {
        alert('无效的备份文件格式')
        setImporting(false)
        return
      }

      const result = await importAllData(data, { skipExisting: true })
      setImportResult(result)
      loadStats()

      if (result.success) {
        alert(`导入成功！\n导入: ${result.imported.characters} 角色卡, ${result.imported.chats} 聊天, ${result.imported.messages} 消息\n跳过: ${result.skipped.characters} 角色卡 (已存在)`)
      } else {
        alert(`导入部分失败: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('导入失败，请检查文件格式')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClearData = async () => {
    if (!confirm('确定清除所有本地数据？此操作不可恢复！\n\n建议先导出备份。')) return
    if (!confirm('再次确认：这将删除所有角色卡、聊天记录、人设等数据。继续？')) return

    try {
      await clearAllData()
      loadStats()
      alert('所有本地数据已清除')
    } catch (error) {
      console.error('Clear data failed:', error)
      alert('清除数据失败')
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">设置</h1>

      {/* 密码输入弹窗 */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" />
                输入解密密码
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                此备份文件已加密，请输入密码进行解密
              </p>
              <Input
                type="password"
                placeholder="输入密码..."
                value={importPassword}
                onChange={e => setImportPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <div className="flex gap-2">
                <Button onClick={handlePasswordSubmit} disabled={!importPassword}>
                  确认解密
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowPasswordDialog(false)
                  setPendingImportFile(null)
                  setImportPassword('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            数据管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <div className="grid grid-cols-5 gap-4 text-center p-4 bg-muted rounded-lg">
              <div>
                <p className="text-2xl font-bold">{stats.characters}</p>
                <p className="text-xs text-muted-foreground">角色卡</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.chats}</p>
                <p className="text-xs text-muted-foreground">聊天</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.messages}</p>
                <p className="text-xs text-muted-foreground">消息</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lorebooks}</p>
                <p className="text-xs text-muted-foreground">世界书</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.personas}</p>
                <p className="text-xs text-muted-foreground">人设</p>
              </div>
            </div>
          )}

          {/* 加密导出选项 */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">导出设置</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="encryptExport"
                checked={encryptExport}
                onChange={e => setEncryptExport(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="encryptExport" className="text-sm">
                加密导出文件
              </label>
              {encryptExport ? <Lock className="h-3 w-3 text-green-600" /> : <Unlock className="h-3 w-3 text-muted-foreground" />}
            </div>
            {encryptExport && (
              <div className="space-y-1">
                <Input
                  type="password"
                  placeholder="设置加密密码..."
                  value={exportPassword}
                  onChange={e => setExportPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  使用AES-256加密。请牢记密码，丢失后无法恢复数据。
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} disabled={exporting || (encryptExport && !exportPassword)}>
              {encryptExport ? <Lock className="h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              {exporting ? '导出中...' : encryptExport ? '加密导出' : '导出全部数据'}
            </Button>
            <Button variant="outline" onClick={handleImportClick} disabled={importing}>
              <Upload className="h-4 w-4 mr-1" />
              {importing ? '导入中...' : '导入数据'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <Button variant="destructive" onClick={handleClearData}>
              <AlertTriangle className="h-4 w-4 mr-1" />
              清除所有数据
            </Button>
          </div>

          {importResult && (
            <div className="text-sm p-3 bg-muted rounded">
              <p className="font-medium mb-1">导入结果:</p>
              <p>导入: {importResult.imported.characters} 角色卡, {importResult.imported.chats} 聊天, {importResult.imported.messages} 消息</p>
              <p>跳过: {importResult.skipped.characters} 角色卡, {importResult.skipped.chats} 聊天</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI服务商配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">添加AI服务商</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
              <Button key={key} variant="outline" size="sm" onClick={() => addProvider(key as keyof typeof PROVIDER_PRESETS)}>
                <Plus className="h-3 w-3 mr-1" /> {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {providers.map(provider => (
          <Card key={provider.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{provider.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeProvider(provider.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">API Key</label>
                <Input
                  type="password"
                  value={provider.apiKey}
                  onChange={e => updateProvider(provider.id, { apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Base URL</label>
                <Input
                  value={provider.baseURL || ''}
                  onChange={e => updateProvider(provider.id, { baseURL: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">默认模型</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {provider.models.map(model => (
                    <Button
                      key={model}
                      variant={defaultProv?.provider === provider.id && defaultProv?.model === model ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSetDefault(provider.id, model)}
                    >
                      {model}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          请添加AI服务商以开始使用
        </div>
      )}
    </div>
  )
}
