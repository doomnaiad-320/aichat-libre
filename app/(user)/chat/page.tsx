'use client'

import { useState } from 'react'
import { ChatContainer } from '@/components/chat/chat-container'

export default function ChatPage() {
  // 临时配置 - 后续从设置中读取
  const [config] = useState({
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiKey: '',
    baseURL: '',
  })

  if (!config.apiKey) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">配置AI服务</h2>
          <p className="text-muted-foreground">请先在设置中配置API Key</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ChatContainer
        provider={config.provider}
        model={config.model}
        apiKey={config.apiKey}
        baseURL={config.baseURL}
      />
    </div>
  )
}
