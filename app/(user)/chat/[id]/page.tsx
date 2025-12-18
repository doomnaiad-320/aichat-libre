'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { ChatContainer } from '@/components/chat/chat-container'
import { getCharacterById, type LocalCharacter } from '@/lib/db/local'
import { getAIProviders, getDefaultProvider, type AIProviderConfig } from '@/lib/db/local'

function buildSystemPrompt(char: LocalCharacter): string {
  const parts: string[] = []
  if (char.description) parts.push(`角色描述: ${char.description}`)
  if (char.personality) parts.push(`性格: ${char.personality}`)
  if (char.scenario) parts.push(`场景: ${char.scenario}`)
  return parts.join('\n\n')
}

export default function CharacterChatPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.id as string

  const [character, setCharacter] = useState<LocalCharacter | null>(null)
  const [providers, setProviders] = useState<AIProviderConfig[]>([])
  const [selectedProvider, setSelectedProvider] = useState<AIProviderConfig | null>(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const char = await getCharacterById(characterId)
      if (!char) {
        router.push('/characters')
        return
      }
      setCharacter(char)

      const provs = await getAIProviders()
      const enabledProvs = provs.filter(p => p.enabled && p.apiKey)
      setProviders(enabledProvs)

      const defaultProv = await getDefaultProvider()
      if (defaultProv) {
        const prov = enabledProvs.find(p => p.id === defaultProv.provider)
        if (prov) {
          setSelectedProvider(prov)
          setSelectedModel(defaultProv.model)
        }
      } else if (enabledProvs.length > 0) {
        setSelectedProvider(enabledProvs[0])
        setSelectedModel(enabledProvs[0].models[0])
      }

      setLoading(false)
    }
    load()
  }, [characterId, router])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (!character) return null

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

  const systemPrompt = buildSystemPrompt(character)

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-2 flex items-center gap-3">
        <Link href="/characters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {character.name.charAt(0)}
          </div>
          <span className="font-medium">{character.name}</span>
        </div>
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
          systemPrompt={systemPrompt}
        />
      </div>
    </div>
  )
}
