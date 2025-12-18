'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { getMessagesByChat, addMessage, updateMessage } from '@/lib/db/local'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  chatId?: string
  provider: string
  model: string
  apiKey: string
  baseURL?: string
  systemPrompt?: string
  onFirstMessage?: () => void
}

export function ChatContainer({ chatId, provider, model, apiKey, baseURL, systemPrompt, onFirstMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const hasCalledFirstMessage = useRef(false)

  useEffect(() => {
    if (chatId) {
      loadMessages()
    } else {
      setMessages([])
    }
    hasCalledFirstMessage.current = false
  }, [chatId])

  const loadMessages = async () => {
    if (!chatId) return
    const stored = await getMessagesByChat(chatId)
    setMessages(
      stored
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
    )
  }

  const sendMessage = async (content: string) => {
    if (!chatId) return

    // 首次发送消息时触发回调
    if (messages.length === 0 && !hasCalledFirstMessage.current && onFirstMessage) {
      hasCalledFirstMessage.current = true
      onFirstMessage()
    }

    // 保存用户消息
    const userMsg = await addMessage(chatId, 'user', content)
    const displayUserMsg: Message = { id: userMsg.id, role: 'user', content }
    setMessages(prev => [...prev, displayUserMsg])
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

      // 创建助手消息占位
      const assistantMsg = await addMessage(chatId, 'assistant', '')
      const displayAssistantMsg: Message = { id: assistantMsg.id, role: 'assistant', content: '' }
      setMessages(prev => [...prev, displayAssistantMsg])

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        fullContent += text
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id ? { ...m, content: fullContent } : m
        ))
      }

      // 保存完整的助手回复
      await updateMessage(assistantMsg.id, fullContent)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} isLoading={isLoading} disabled={!chatId} />
    </div>
  )
}
