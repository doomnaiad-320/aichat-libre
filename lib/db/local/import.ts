import { localDb } from './schema'
import type { ExportData } from './export'

// 导入结果
export interface ImportResult {
  success: boolean
  imported: {
    characters: number
    chats: number
    messages: number
    lorebooks: number
    workingMemory: number
    episodicMemory: number
    semanticMemory: number
    personas: number
    settings: number
  }
  skipped: {
    characters: number
    chats: number
    messages: number
    lorebooks: number
    workingMemory: number
    episodicMemory: number
    semanticMemory: number
    personas: number
    settings: number
  }
  errors: string[]
}

// 导入选项
export interface ImportOptions {
  overwrite?: boolean // 是否覆盖已存在的数据
  skipExisting?: boolean // 是否跳过已存在的数据
}

// 验证导入数据格式
export function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false

  const d = data as Record<string, unknown>

  if (typeof d.version !== 'string') return false
  if (typeof d.exportedAt !== 'string') return false
  if (!d.data || typeof d.data !== 'object') return false

  const inner = d.data as Record<string, unknown>

  // 检查必要的数组字段
  const requiredArrays = [
    'characters', 'chats', 'messages', 'lorebooks',
    'workingMemory', 'episodicMemory', 'semanticMemory',
    'personas', 'settings'
  ]

  for (const key of requiredArrays) {
    if (!Array.isArray(inner[key])) return false
  }

  return true
}

// 从JSON字符串解析导入数据
export function parseImportData(json: string): ExportData | null {
  try {
    const data = JSON.parse(json)
    if (validateImportData(data)) {
      return data
    }
    return null
  } catch {
    return null
  }
}

// 从文件读取导入数据
export async function readImportFile(file: File): Promise<ExportData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const json = e.target?.result as string
      resolve(parseImportData(json))
    }
    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}

// 导入所有数据
export async function importAllData(
  data: ExportData,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const { overwrite = false, skipExisting = true } = options

  const result: ImportResult = {
    success: true,
    imported: {
      characters: 0,
      chats: 0,
      messages: 0,
      lorebooks: 0,
      workingMemory: 0,
      episodicMemory: 0,
      semanticMemory: 0,
      personas: 0,
      settings: 0
    },
    skipped: {
      characters: 0,
      chats: 0,
      messages: 0,
      lorebooks: 0,
      workingMemory: 0,
      episodicMemory: 0,
      semanticMemory: 0,
      personas: 0,
      settings: 0
    },
    errors: []
  }

  try {
    // 导入角色卡
    for (const character of data.data.characters) {
      const existing = await localDb.characters.get(character.id)
      if (existing) {
        if (overwrite) {
          await localDb.characters.put(character)
          result.imported.characters++
        } else if (skipExisting) {
          result.skipped.characters++
        }
      } else {
        await localDb.characters.add(character)
        result.imported.characters++
      }
    }

    // 导入聊天
    for (const chat of data.data.chats) {
      const existing = await localDb.chats.get(chat.id)
      if (existing) {
        if (overwrite) {
          await localDb.chats.put(chat)
          result.imported.chats++
        } else if (skipExisting) {
          result.skipped.chats++
        }
      } else {
        await localDb.chats.add(chat)
        result.imported.chats++
      }
    }

    // 导入消息
    for (const message of data.data.messages) {
      const existing = await localDb.messages.get(message.id)
      if (existing) {
        if (overwrite) {
          await localDb.messages.put(message)
          result.imported.messages++
        } else if (skipExisting) {
          result.skipped.messages++
        }
      } else {
        await localDb.messages.add(message)
        result.imported.messages++
      }
    }

    // 导入世界书
    for (const lorebook of data.data.lorebooks) {
      const existing = await localDb.lorebooks.get(lorebook.id)
      if (existing) {
        if (overwrite) {
          await localDb.lorebooks.put(lorebook)
          result.imported.lorebooks++
        } else if (skipExisting) {
          result.skipped.lorebooks++
        }
      } else {
        await localDb.lorebooks.add(lorebook)
        result.imported.lorebooks++
      }
    }

    // 导入工作记忆
    for (const memory of data.data.workingMemory) {
      const existing = await localDb.workingMemory.get(memory.id)
      if (existing) {
        if (overwrite) {
          await localDb.workingMemory.put(memory)
          result.imported.workingMemory++
        } else if (skipExisting) {
          result.skipped.workingMemory++
        }
      } else {
        await localDb.workingMemory.add(memory)
        result.imported.workingMemory++
      }
    }

    // 导入情节记忆
    for (const memory of data.data.episodicMemory) {
      const existing = await localDb.episodicMemory.get(memory.id)
      if (existing) {
        if (overwrite) {
          await localDb.episodicMemory.put(memory)
          result.imported.episodicMemory++
        } else if (skipExisting) {
          result.skipped.episodicMemory++
        }
      } else {
        await localDb.episodicMemory.add(memory)
        result.imported.episodicMemory++
      }
    }

    // 导入语义记忆
    for (const memory of data.data.semanticMemory) {
      const existing = await localDb.semanticMemory.get(memory.id)
      if (existing) {
        if (overwrite) {
          await localDb.semanticMemory.put(memory)
          result.imported.semanticMemory++
        } else if (skipExisting) {
          result.skipped.semanticMemory++
        }
      } else {
        await localDb.semanticMemory.add(memory)
        result.imported.semanticMemory++
      }
    }

    // 导入人设
    for (const persona of data.data.personas) {
      const existing = await localDb.personas.get(persona.id)
      if (existing) {
        if (overwrite) {
          await localDb.personas.put(persona)
          result.imported.personas++
        } else if (skipExisting) {
          result.skipped.personas++
        }
      } else {
        await localDb.personas.add(persona)
        result.imported.personas++
      }
    }

    // 导入设置
    for (const setting of data.data.settings) {
      const existing = await localDb.settings.get(setting.id)
      if (existing) {
        if (overwrite) {
          await localDb.settings.put(setting)
          result.imported.settings++
        } else if (skipExisting) {
          result.skipped.settings++
        }
      } else {
        await localDb.settings.add(setting)
        result.imported.settings++
      }
    }

  } catch (error) {
    result.success = false
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }

  return result
}

// 清除所有本地数据
export async function clearAllData(): Promise<void> {
  await Promise.all([
    localDb.characters.clear(),
    localDb.chats.clear(),
    localDb.messages.clear(),
    localDb.lorebooks.clear(),
    localDb.workingMemory.clear(),
    localDb.episodicMemory.clear(),
    localDb.semanticMemory.clear(),
    localDb.personas.clear(),
    localDb.settings.clear()
  ])
}
