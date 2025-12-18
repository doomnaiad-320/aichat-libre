import {
  localDb,
  type LocalCharacter,
  type LocalChat,
  type LocalMessage,
  type LocalLorebook,
  type LocalWorkingMemory,
  type LocalEpisodicMemory,
  type LocalSemanticMemory,
  type LocalPersona,
  type LocalSettings
} from './schema'

// 导出数据格式
export interface ExportData {
  version: string
  exportedAt: string
  data: {
    characters: LocalCharacter[]
    chats: LocalChat[]
    messages: LocalMessage[]
    lorebooks: LocalLorebook[]
    workingMemory: LocalWorkingMemory[]
    episodicMemory: LocalEpisodicMemory[]
    semanticMemory: LocalSemanticMemory[]
    personas: LocalPersona[]
    settings: LocalSettings[]
  }
}

// 导出所有本地数据
export async function exportAllData(): Promise<ExportData> {
  const [
    characters,
    chats,
    messages,
    lorebooks,
    workingMemory,
    episodicMemory,
    semanticMemory,
    personas,
    settings
  ] = await Promise.all([
    localDb.characters.toArray(),
    localDb.chats.toArray(),
    localDb.messages.toArray(),
    localDb.lorebooks.toArray(),
    localDb.workingMemory.toArray(),
    localDb.episodicMemory.toArray(),
    localDb.semanticMemory.toArray(),
    localDb.personas.toArray(),
    localDb.settings.toArray()
  ])

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      characters,
      chats,
      messages,
      lorebooks,
      workingMemory,
      episodicMemory,
      semanticMemory,
      personas,
      settings
    }
  }
}

// 导出单个角色卡及其相关数据
export async function exportCharacterData(characterId: string): Promise<ExportData | null> {
  const character = await localDb.characters.get(characterId)
  if (!character) return null

  const chats = await localDb.chats.where('characterId').equals(characterId).toArray()
  const chatIds = chats.map(c => c.id)

  const [
    messages,
    lorebooks,
    workingMemory,
    episodicMemory,
    semanticMemory
  ] = await Promise.all([
    localDb.messages.where('chatId').anyOf(chatIds).toArray(),
    localDb.lorebooks.where('characterId').equals(characterId).toArray(),
    localDb.workingMemory.where('chatId').anyOf(chatIds).toArray(),
    localDb.episodicMemory.where('chatId').anyOf(chatIds).toArray(),
    localDb.semanticMemory.where('characterId').equals(characterId).toArray()
  ])

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      characters: [character],
      chats,
      messages,
      lorebooks,
      workingMemory,
      episodicMemory,
      semanticMemory,
      personas: [],
      settings: []
    }
  }
}

// 将导出数据转换为JSON字符串
export function exportDataToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

// 下载导出数据为文件
export function downloadExportData(data: ExportData, filename?: string): void {
  const json = exportDataToJSON(data)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || `aichat-libre-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 导出统计信息
export async function getExportStats(): Promise<{
  characters: number
  chats: number
  messages: number
  lorebooks: number
  personas: number
}> {
  const [characters, chats, messages, lorebooks, personas] = await Promise.all([
    localDb.characters.count(),
    localDb.chats.count(),
    localDb.messages.count(),
    localDb.lorebooks.count(),
    localDb.personas.count()
  ])

  return {
    characters,
    chats,
    messages,
    lorebooks,
    personas
  }
}
