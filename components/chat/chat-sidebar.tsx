'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageCircle, Trash2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { cn } from '@/lib/utils/cn'
import {
  getChatsByCharacter,
  createChat,
  deleteChat,
  type LocalChat
} from '@/lib/db/local'

type Props = {
  characterId: string
  currentChatId?: string
  onSelectChat: (chatId: string) => void
  onNewChat: (chat: LocalChat) => void
  isOpen?: boolean
  onClose?: () => void
}

export function ChatSidebar({ characterId, currentChatId, onSelectChat, onNewChat, isOpen = true, onClose }: Props) {
  const [chats, setChats] = useState<LocalChat[]>([])

  useEffect(() => {
    loadChats()
  }, [characterId])

  const loadChats = async () => {
    const data = await getChatsByCharacter(characterId)
    setChats(data)
  }

  const handleNewChat = async () => {
    const chat = await createChat(characterId)
    setChats(prev => [chat, ...prev])
    onNewChat(chat)
    onClose?.()
  }

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    if (confirm('确定删除此对话？')) {
      await deleteChat(chatId)
      setChats(prev => prev.filter(c => c.id !== chatId))
      if (currentChatId === chatId && chats.length > 1) {
        const remaining = chats.filter(c => c.id !== chatId)
        if (remaining.length > 0) {
          onSelectChat(remaining[0].id)
        }
      }
    }
  }

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId)
    onClose?.()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        // Base styles
        "h-full flex flex-col bg-muted/30 border-r",
        // Mobile: slide-in drawer
        "fixed md:relative inset-y-0 left-0 z-50 w-72 md:w-64",
        "transform transition-transform duration-200 ease-in-out",
        // Mobile visibility
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b">
          <span className="font-medium">对话列表</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 border-b">
          <Button onClick={handleNewChat} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-1" /> 新对话
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无对话</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-3 md:py-2 cursor-pointer hover:bg-muted group",
                  currentChatId === chat.id && "bg-muted"
                )}
              >
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{chat.title}</span>
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-4 w-4 md:h-3 md:w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
