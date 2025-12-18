'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { ChatContainer } from '@/components/chat/chat-container'
import { getAIProviders, getDefaultProvider, type AIProviderConfig } from '@/lib/db/local'

export default function ChatPage() {
  const [providers, setProviders] = useState<AIProviderConfig[]>([])
  const [selectedProvider, setSelectedProvider] = useState<AIProviderConfig | null>(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadConfig() {
      const provs = await getAIProviders()
      setProviders(provs.filter(p => p.enabled && p.apiKey))

      const defaultProv = await getDefaultProvider()
      if (defaultProv) {
        const prov = provs.find(p => p.id === defaultProv.provider)
        if (prov && prov.apiKey) {
          setSelectedProvider(prov)
          setSelectedModel(defaultProv.model)
        }
      }
      setLoading(false)
    }
    loadConfig()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">配置AI服务</h2>
          <p className="text-muted-foreground">请先在设置中配置API Key</p>
          <Link href="/settings">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              前往设置
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!selectedProvider) {
    setSelectedProvider(providers[0])
    setSelectedModel(providers[0].models[0])
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-2 flex items-center gap-2">
        <select
          value={selectedProvider.id}
          onChange={e => {
            const prov = providers.find(p => p.id === e.target.value)
            if (prov) {
              setSelectedProvider(prov)
              setSelectedModel(prov.models[0])
            }
          }}
          className="text-sm border rounded px-2 py-1 bg-background"
        >
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
          className="text-sm border rounded px-2 py-1 bg-background"
        >
          {selectedProvider.models.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <ChatContainer
          provider={selectedProvider.type}
          model={selectedModel}
          apiKey={selectedProvider.apiKey}
          baseURL={selectedProvider.baseURL}
        />
      </div>
    </div>
  )
}
