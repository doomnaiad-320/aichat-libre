'use client'

import { MessageCircle } from 'lucide-react'

export default function UserHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <MessageCircle size={80} className="text-blue-500" />
      <h1 className="text-4xl font-bold">AI Chat Libre</h1>
      <p className="text-gray-500">AI角色扮演聊天平台</p>
      <div className="flex gap-4 mt-4">
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          开始聊天
        </button>
        <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          浏览角色
        </button>
      </div>
    </div>
  )
}
