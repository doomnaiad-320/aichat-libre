// 记忆管理器 - 统一管理工作记忆、情节记忆和语义记忆

import { localDb, type LocalWorkingMemory, type LocalEpisodicMemory, type LocalSemanticMemory } from '@/lib/db/local'
import { VectorIndex, type VectorEntry } from './vector-index'
import { generateEmbedding, type EmbeddingConfig } from './embeddings'

// 记忆类型
export type MemoryType = 'working' | 'episodic' | 'semantic'

// 统一记忆条目
export interface MemoryEntry {
  id: string
  type: MemoryType
  content: string
  embedding?: number[]
  metadata: {
    chatId?: string
    characterId?: string
    importance?: number
    emotion?: string
    category?: string
    timestamp: Date
  }
}

// 记忆管理器类
export class MemoryManager {
  private vectorIndex: VectorIndex
  private embeddingConfig: EmbeddingConfig | null = null

  constructor() {
    this.vectorIndex = new VectorIndex()
  }

  // 设置Embedding配置
  setEmbeddingConfig(config: EmbeddingConfig): void {
    this.embeddingConfig = config
  }

  // 生成ID
  private generateId(type: MemoryType): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  // === 工作记忆 ===

  // 获取聊天的工作记忆
  async getWorkingMemory(chatId: string): Promise<LocalWorkingMemory | undefined> {
    return localDb.workingMemory.where('chatId').equals(chatId).first()
  }

  // 更新工作记忆（对话摘要）
  async updateWorkingMemory(
    chatId: string,
    summary: string,
    keyPoints: string[]
  ): Promise<void> {
    const existing = await this.getWorkingMemory(chatId)
    if (existing) {
      await localDb.workingMemory.update(existing.id, {
        summary,
        keyPoints,
        updatedAt: new Date()
      })
    } else {
      await localDb.workingMemory.add({
        id: this.generateId('working'),
        chatId,
        summary,
        keyPoints,
        updatedAt: new Date()
      })
    }
  }

  // === 情节记忆 ===

  // 添加情节记忆
  async addEpisodicMemory(
    chatId: string,
    event: string,
    participants: string[],
    importance: number = 5,
    emotion?: string
  ): Promise<LocalEpisodicMemory> {
    const memory: LocalEpisodicMemory = {
      id: this.generateId('episodic'),
      chatId,
      event,
      participants,
      importance,
      emotion,
      createdAt: new Date()
    }

    await localDb.episodicMemory.add(memory)

    // 如果有Embedding配置，生成向量并添加到索引
    if (this.embeddingConfig) {
      try {
        const result = await generateEmbedding(event, this.embeddingConfig)
        this.vectorIndex.add(memory.id, result.embedding, {
          type: 'episodic',
          chatId,
          importance,
          emotion
        })
      } catch (error) {
        console.error('Failed to generate embedding for episodic memory:', error)
      }
    }

    return memory
  }

  // 获取聊天的情节记忆
  async getEpisodicMemories(
    chatId: string,
    limit: number = 20
  ): Promise<LocalEpisodicMemory[]> {
    return localDb.episodicMemory
      .where('chatId')
      .equals(chatId)
      .reverse()
      .sortBy('importance')
      .then(memories => memories.slice(0, limit))
  }

  // === 语义记忆 ===

  // 添加语义记忆
  async addSemanticMemory(
    characterId: string,
    fact: string,
    category: string,
    confidence: number = 0.8,
    source?: string
  ): Promise<LocalSemanticMemory> {
    const memory: LocalSemanticMemory = {
      id: this.generateId('semantic'),
      characterId,
      fact,
      category,
      confidence,
      source,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await localDb.semanticMemory.add(memory)

    // 如果有Embedding配置，生成向量并添加到索引
    if (this.embeddingConfig) {
      try {
        const result = await generateEmbedding(fact, this.embeddingConfig)
        this.vectorIndex.add(memory.id, result.embedding, {
          type: 'semantic',
          characterId,
          category,
          confidence
        })
      } catch (error) {
        console.error('Failed to generate embedding for semantic memory:', error)
      }
    }

    return memory
  }

  // 获取角色的语义记忆
  async getSemanticMemories(
    characterId: string,
    category?: string
  ): Promise<LocalSemanticMemory[]> {
    if (category) {
      return localDb.semanticMemory
        .where('[characterId+category]')
        .equals([characterId, category])
        .toArray()
    }
    return localDb.semanticMemory.where('characterId').equals(characterId).toArray()
  }

  // === RAG检索 ===

  // 相关记忆检索
  async searchRelevantMemories(
    query: string,
    options: {
      chatId?: string
      characterId?: string
      types?: MemoryType[]
      topK?: number
      threshold?: number
    } = {}
  ): Promise<Array<{ memory: MemoryEntry; score: number }>> {
    if (!this.embeddingConfig) {
      return []
    }

    const { topK = 5, threshold = 0.5 } = options

    try {
      // 生成查询向量
      const result = await generateEmbedding(query, this.embeddingConfig)

      // 创建过滤器
      const filter = (entry: VectorEntry) => {
        const metadata = entry.metadata
        if (options.chatId && metadata.chatId !== options.chatId) return false
        if (options.characterId && metadata.characterId !== options.characterId) return false
        if (options.types && !options.types.includes(metadata.type as MemoryType)) return false
        return true
      }

      // 执行向量搜索
      const searchResults = this.vectorIndex.searchWithThreshold(
        result.embedding,
        threshold,
        topK,
        filter
      )

      // 转换为MemoryEntry
      const memories: Array<{ memory: MemoryEntry; score: number }> = []

      for (const { entry, score } of searchResults) {
        const metadata = entry.metadata as {
          type: MemoryType
          chatId?: string
          characterId?: string
          importance?: number
          emotion?: string
          category?: string
        }

        memories.push({
          memory: {
            id: entry.id,
            type: metadata.type,
            content: '', // 需要从数据库获取
            embedding: entry.vector,
            metadata: {
              chatId: metadata.chatId,
              characterId: metadata.characterId,
              importance: metadata.importance,
              emotion: metadata.emotion,
              category: metadata.category,
              timestamp: new Date()
            }
          },
          score
        })
      }

      return memories
    } catch (error) {
      console.error('Failed to search relevant memories:', error)
      return []
    }
  }

  // 加载索引（从数据库恢复向量）
  async loadIndex(chatId?: string, characterId?: string): Promise<void> {
    if (!this.embeddingConfig) return

    const entries: VectorEntry[] = []

    // 加载情节记忆
    const episodic = chatId
      ? await localDb.episodicMemory.where('chatId').equals(chatId).toArray()
      : await localDb.episodicMemory.toArray()

    for (const memory of episodic) {
      try {
        const result = await generateEmbedding(memory.event, this.embeddingConfig)
        entries.push({
          id: memory.id,
          vector: result.embedding,
          metadata: {
            type: 'episodic',
            chatId: memory.chatId,
            importance: memory.importance,
            emotion: memory.emotion
          }
        })
      } catch {
        // 忽略单个错误
      }
    }

    // 加载语义记忆
    const semantic = characterId
      ? await localDb.semanticMemory.where('characterId').equals(characterId).toArray()
      : await localDb.semanticMemory.toArray()

    for (const memory of semantic) {
      try {
        const result = await generateEmbedding(memory.fact, this.embeddingConfig)
        entries.push({
          id: memory.id,
          vector: result.embedding,
          metadata: {
            type: 'semantic',
            characterId: memory.characterId,
            category: memory.category,
            confidence: memory.confidence
          }
        })
      } catch {
        // 忽略单个错误
      }
    }

    this.vectorIndex.addBatch(entries)
  }

  // 清空索引
  clearIndex(): void {
    this.vectorIndex.clear()
  }
}

// 创建默认实例
export const memoryManager = new MemoryManager()
