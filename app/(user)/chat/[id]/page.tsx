'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { ChatContainer } from '@/components/chat/chat-container'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import {
  getCharacterById,
  getChatsByCharacter,
  createChat,
  updateChat,
  getAllPersonas,
  getDefaultPersona,
  buildPersonaPrompt,
  type LocalCharacter,
  type LocalChat,
  type LocalPersona
} from '@/lib/db/local'
import { getAIProviders, getDefaultProvider, type AIProviderConfig } from '@/lib/db/local'

function buildSystemPrompt(char: LocalCharacter, persona?: LocalPersona): string {
  const parts: string[] = []

  // 人设信息
  if (persona) {
    const personaPrompt = buildPersonaPrompt(persona)
    if (personaPrompt) parts.push(personaPrompt)
  }

  // 角色信息
  parts.push('[角色设定]')
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
  const [currentChat, setCurrentChat] = useState<LocalChat | null>(null)
  const [providers, setProviders] = useState<AIProviderConfig[]>([])
  const [selectedProvider, setSelectedProvider] = useState<AIProviderConfig | null>(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [personas, setPersonas] = useState<LocalPersona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<LocalPersona | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const char = await getCharacterById(characterId)
      if (!char) {
        router.push('/characters')
        return
      }
      setCharacter(char)

      // 加载或创建聊天
      const chats = await getChatsByCharacter(characterId)
      if (chats.length > 0) {
        setCurrentChat(chats[0])
      } else {
        const newChat = await createChat(characterId, `与${char.name}的对话`)
        setCurrentChat(newChat)
      }

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

      // 加载人设
      const allPersonas = await getAllPersonas()
      setPersonas(allPersonas)
      const defaultPersona = await getDefaultPersona()
      if (defaultPersona) {
        setSelectedPersona(defaultPersona)
      }

      setLoading(false)
    }
    load()
  }, [characterId, router])

  const handleSelectChat = async (chatId: string) => {
    const chats = await getChatsByCharacter(characterId)
    const chat = chats.find(c => c.id === chatId)
    if (chat) setCurrentChat(chat)
  }

  const handleNewChat = (chat: LocalChat) => {
    setCurrentChat(chat)
  }

  const handleFirstMessage = async () => {
    // 首次发送消息时更新标题
    if (currentChat && character) {
      await updateChat(currentChat.id, { title: `与${character.name}的对话` })
    }
  }

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

  const systemPrompt = buildSystemPrompt(character, selectedPersona || undefined)

  return (
    <div className="h-full flex">
      <ChatSidebar
        characterId={characterId}
        currentChatId={currentChat?.id}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col">
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
          {personas.length > 0 && (
            <select
              value={selectedPersona?.id || ''}
              onChange={e => {
                const persona = personas.find(p => p.id === e.target.value)
                setSelectedPersona(persona || null)
              }}
              className="text-sm border rounded px-2 py-1 bg-background"
              title="选择人设"
            >
              <option value="">无人设</option>
              {personas.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
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
            chatId={currentChat?.id}
            provider={selectedProvider.type}
            model={selectedModel}
            apiKey={selectedProvider.apiKey}
            baseURL={selectedProvider.baseURL}
            systemPrompt={systemPrompt}
            onFirstMessage={handleFirstMessage}
          />
        </div>
      </div>
    </div>
  )
}
