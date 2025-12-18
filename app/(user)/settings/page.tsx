'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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

const PROVIDER_PRESETS = {
  openai: { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  anthropic: { name: 'Anthropic', baseURL: 'https://api.anthropic.com', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  deepseek: { name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-coder'] },
  siliconflow: { name: '硅基流动', baseURL: 'https://api.siliconflow.cn/v1', models: ['Qwen/Qwen2.5-72B-Instruct'] },
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<AIProviderConfig[]>([])
  const [defaultProv, setDefaultProv] = useState<{ provider: string; model: string } | null>(null)

  useEffect(() => {
    getAIProviders().then(setProviders)
    getDefaultProvider().then(setDefaultProv)
  }, [])

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

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-6">设置</h1>

      <Card className="mb-6">
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
