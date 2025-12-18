// 上下文构建器 - 动态构建聊天上下文

import { memoryManager, type MemoryType } from './memory-manager'
import type { LocalCharacter, LocalPersona } from '@/lib/db/local'
import { buildPersonaPrompt } from '@/lib/db/local/personas'

export interface ContextConfig {
  maxTokens: number // 最大Token数（估算）
  workingMemoryTokens: number // 工作记忆预算
  episodicMemoryTokens: number // 情节记忆预算
  semanticMemoryTokens: number // 语义记忆预算
  lorebookTokens: number // 世界书预算
}

export interface ContextPart {
  type: 'system' | 'persona' | 'character' | 'working' | 'episodic' | 'semantic' | 'lorebook'
  content: string
  tokens: number // 估算Token数
}

// 简单Token估算（中文约1.5字符/token，英文约4字符/token）
function estimateTokens(text: string): number {
  // 混合估算
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars / 1.5 + otherChars / 4)
}

// 截断文本到指定Token数
function truncateToTokens(text: string, maxTokens: number): string {
  const currentTokens = estimateTokens(text)
  if (currentTokens <= maxTokens) return text

  // 按比例截断
  const ratio = maxTokens / currentTokens
  const targetLength = Math.floor(text.length * ratio * 0.95) // 留5%余量
  return text.slice(0, targetLength) + '...'
}

// 默认配置
export const defaultContextConfig: ContextConfig = {
  maxTokens: 4000,
  workingMemoryTokens: 500,
  episodicMemoryTokens: 800,
  semanticMemoryTokens: 500,
  lorebookTokens: 500
}

// 构建上下文
export async function buildContext(
  character: LocalCharacter,
  options: {
    chatId: string
    persona?: LocalPersona
    recentMessages?: Array<{ role: string; content: string }>
    query?: string // 用于RAG检索的查询
    config?: Partial<ContextConfig>
  }
): Promise<{ systemPrompt: string; parts: ContextPart[] }> {
  const config = { ...defaultContextConfig, ...options.config }
  const parts: ContextPart[] = []

  // 1. 人设信息
  if (options.persona) {
    const personaPrompt = buildPersonaPrompt(options.persona)
    if (personaPrompt) {
      parts.push({
        type: 'persona',
        content: personaPrompt,
        tokens: estimateTokens(personaPrompt)
      })
    }
  }

  // 2. 角色设定
  const characterParts: string[] = ['[角色设定]']
  if (character.description) characterParts.push(`描述: ${character.description}`)
  if (character.personality) characterParts.push(`性格: ${character.personality}`)
  if (character.scenario) characterParts.push(`场景: ${character.scenario}`)
  const characterContent = characterParts.join('\n')
  parts.push({
    type: 'character',
    content: characterContent,
    tokens: estimateTokens(characterContent)
  })

  // 3. 工作记忆（对话摘要）
  const workingMemory = await memoryManager.getWorkingMemory(options.chatId)
  if (workingMemory) {
    let workingContent = `[对话摘要]\n${workingMemory.summary}`
    if (workingMemory.keyPoints.length > 0) {
      workingContent += `\n\n关键点:\n${workingMemory.keyPoints.map(p => `- ${p}`).join('\n')}`
    }
    workingContent = truncateToTokens(workingContent, config.workingMemoryTokens)
    parts.push({
      type: 'working',
      content: workingContent,
      tokens: estimateTokens(workingContent)
    })
  }

  // 4. 情节记忆（RAG检索）
  if (options.query) {
    const relevantMemories = await memoryManager.searchRelevantMemories(options.query, {
      chatId: options.chatId,
      types: ['episodic'] as MemoryType[],
      topK: 5,
      threshold: 0.6
    })

    if (relevantMemories.length > 0) {
      // 获取实际内容
      const episodicMemories = await memoryManager.getEpisodicMemories(options.chatId)
      const relevantIds = new Set(relevantMemories.map(m => m.memory.id))
      const filtered = episodicMemories.filter(m => relevantIds.has(m.id))

      if (filtered.length > 0) {
        let episodicContent = '[相关记忆]\n' + filtered.map(m => `- ${m.event}`).join('\n')
        episodicContent = truncateToTokens(episodicContent, config.episodicMemoryTokens)
        parts.push({
          type: 'episodic',
          content: episodicContent,
          tokens: estimateTokens(episodicContent)
        })
      }
    }
  }

  // 5. 语义记忆（角色/用户知识）
  const semanticMemories = await memoryManager.getSemanticMemories(character.id)
  if (semanticMemories.length > 0) {
    let semanticContent = '[角色知识]\n' + semanticMemories.map(m => `- ${m.fact}`).join('\n')
    semanticContent = truncateToTokens(semanticContent, config.semanticMemoryTokens)
    parts.push({
      type: 'semantic',
      content: semanticContent,
      tokens: estimateTokens(semanticContent)
    })
  }

  // 6. 组装系统提示词
  const systemPrompt = parts.map(p => p.content).join('\n\n')

  return { systemPrompt, parts }
}

// 获取总Token数
export function getTotalTokens(parts: ContextPart[]): number {
  return parts.reduce((sum, part) => sum + part.tokens, 0)
}
