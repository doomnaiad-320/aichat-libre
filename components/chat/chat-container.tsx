'use client'

import { useState } from 'react'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  provider: string
  model: string
  apiKey: string
  baseURL?: string
  systemPrompt?: string
}

export function ChatContainer({ provider, model, apiKey, baseURL, systemPrompt }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const allMessages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content }
      ]

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, provider, model, apiKey, baseURL })
      })

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMsg])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id ? { ...m, content: m.content + text } : m
        ))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  )
}
