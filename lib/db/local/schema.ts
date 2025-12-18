import Dexie, { type EntityTable } from 'dexie'

// 角色卡本地数据
export interface LocalCharacter {
  id: string
  name: string
  avatar?: string
  description?: string
  personality?: string
  scenario?: string
  firstMessage?: string
  exampleDialogue?: string
  tags?: string[]
  // SillyTavern兼容字段
  cardData?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// 聊天会话
export interface LocalChat {
  id: string
  characterId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

// 聊天消息
export interface LocalMessage {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  // 消息元数据
  metadata?: {
    model?: string
    tokens?: number
    regenerated?: boolean
  }
  createdAt: Date
}

// 世界书/Lorebook条目
export interface LocalLorebook {
  id: string
  characterId?: string // 可选关联角色
  name: string
  entries: LorebookEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface LorebookEntry {
  id: string
  keys: string[] // 触发关键词
  content: string
  enabled: boolean
  priority: number
  // 插入位置: before_char, after_char, before_example, after_example
  position?: string
}

// 记忆系统 - 工作记忆
export interface LocalWorkingMemory {
  id: string
  chatId: string
  summary: string // 当前对话摘要
  keyPoints: string[] // 关键点
  updatedAt: Date
}

// 记忆系统 - 情节记忆
export interface LocalEpisodicMemory {
  id: string
  chatId: string
  event: string // 事件描述
  participants: string[] // 参与者
  emotion?: string // 情感标签
  importance: number // 重要性 1-10
  createdAt: Date
}

// 记忆系统 - 语义记忆
export interface LocalSemanticMemory {
  id: string
  characterId: string
  fact: string // 事实/知识
  category: string // 分类
  source?: string // 来源
  confidence: number // 置信度 0-1
  createdAt: Date
  updatedAt: Date
}

// 用户设置
export interface LocalSettings {
  id: string
  key: string
  value: unknown
  updatedAt: Date
}

// Dexie数据库定义
export class LocalDatabase extends Dexie {
  characters!: EntityTable<LocalCharacter, 'id'>
  chats!: EntityTable<LocalChat, 'id'>
  messages!: EntityTable<LocalMessage, 'id'>
  lorebooks!: EntityTable<LocalLorebook, 'id'>
  workingMemory!: EntityTable<LocalWorkingMemory, 'id'>
  episodicMemory!: EntityTable<LocalEpisodicMemory, 'id'>
  semanticMemory!: EntityTable<LocalSemanticMemory, 'id'>
  settings!: EntityTable<LocalSettings, 'id'>

  constructor() {
    super('AIChatLibre')

    this.version(1).stores({
      characters: 'id, name, createdAt, updatedAt',
      chats: 'id, characterId, createdAt, updatedAt',
      messages: 'id, chatId, role, createdAt',
      lorebooks: 'id, characterId, name, createdAt',
      workingMemory: 'id, chatId, updatedAt',
      episodicMemory: 'id, chatId, importance, createdAt',
      semanticMemory: 'id, characterId, category, createdAt',
      settings: 'id, key'
    })
  }
}

export const localDb = new LocalDatabase()
