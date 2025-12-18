'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/admin/ui/button'
import { Send } from 'lucide-react'

type Props = {
  onSend: (content: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入消息..."
        className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      <Button type="submit" disabled={isLoading || !input.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
