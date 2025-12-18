'use client'

import { cn } from '@/lib/utils/cn'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        开始新对话
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2",
            msg.role === 'user'
              ? "ml-auto bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
      ))}
    </div>
  )
}
