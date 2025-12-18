import { localDb, type LocalLorebook, type LorebookEntry } from './schema'

// 生成唯一ID
function generateId(prefix: string = 'lorebook'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// 获取所有Lorebook
export async function getAllLorebooks(): Promise<LocalLorebook[]> {
  return localDb.lorebooks.orderBy('createdAt').reverse().toArray()
}

// 获取角色关联的Lorebook
export async function getLorebooksByCharacter(characterId: string): Promise<LocalLorebook[]> {
  return localDb.lorebooks.where('characterId').equals(characterId).toArray()
}

// 获取全局Lorebook（无角色关联）
export async function getGlobalLorebooks(): Promise<LocalLorebook[]> {
  return localDb.lorebooks.filter(lb => !lb.characterId).toArray()
}

// 根据ID获取Lorebook
export async function getLorebookById(id: string): Promise<LocalLorebook | undefined> {
  return localDb.lorebooks.get(id)
}

// 创建Lorebook
export async function createLorebook(
  data: Omit<LocalLorebook, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LocalLorebook> {
  const now = new Date()
  const lorebook: LocalLorebook = {
    ...data,
    id: generateId(),
    entries: data.entries || [],
    createdAt: now,
    updatedAt: now
  }

  await localDb.lorebooks.add(lorebook)
  return lorebook
}

// 更新Lorebook
export async function updateLorebook(
  id: string,
  data: Partial<Omit<LocalLorebook, 'id' | 'createdAt'>>
): Promise<void> {
  await localDb.lorebooks.update(id, {
    ...data,
    updatedAt: new Date()
  })
}

// 删除Lorebook
export async function deleteLorebook(id: string): Promise<void> {
  await localDb.lorebooks.delete(id)
}

// 添加条目到Lorebook
export async function addLorebookEntry(
  lorebookId: string,
  entry: Omit<LorebookEntry, 'id'>
): Promise<LorebookEntry> {
  const lorebook = await getLorebookById(lorebookId)
  if (!lorebook) throw new Error('Lorebook not found')

  const newEntry: LorebookEntry = {
    ...entry,
    id: generateId('entry')
  }

  await updateLorebook(lorebookId, {
    entries: [...lorebook.entries, newEntry]
  })

  return newEntry
}

// 更新Lorebook条目
export async function updateLorebookEntry(
  lorebookId: string,
  entryId: string,
  data: Partial<Omit<LorebookEntry, 'id'>>
): Promise<void> {
  const lorebook = await getLorebookById(lorebookId)
  if (!lorebook) throw new Error('Lorebook not found')

  const entries = lorebook.entries.map(e =>
    e.id === entryId ? { ...e, ...data } : e
  )

  await updateLorebook(lorebookId, { entries })
}

// 删除Lorebook条目
export async function deleteLorebookEntry(
  lorebookId: string,
  entryId: string
): Promise<void> {
  const lorebook = await getLorebookById(lorebookId)
  if (!lorebook) throw new Error('Lorebook not found')

  await updateLorebook(lorebookId, {
    entries: lorebook.entries.filter(e => e.id !== entryId)
  })
}

// 切换条目启用状态
export async function toggleLorebookEntry(
  lorebookId: string,
  entryId: string
): Promise<void> {
  const lorebook = await getLorebookById(lorebookId)
  if (!lorebook) throw new Error('Lorebook not found')

  const entries = lorebook.entries.map(e =>
    e.id === entryId ? { ...e, enabled: !e.enabled } : e
  )

  await updateLorebook(lorebookId, { entries })
}

// === 关键词匹配 ===

export interface MatchOptions {
  caseSensitive?: boolean
  wholeWord?: boolean
}

// 检查文本是否匹配关键词
function matchKeyword(
  text: string,
  keyword: string,
  options: MatchOptions = {}
): boolean {
  const { caseSensitive = false, wholeWord = false } = options

  let searchText = text
  let searchKeyword = keyword

  if (!caseSensitive) {
    searchText = text.toLowerCase()
    searchKeyword = keyword.toLowerCase()
  }

  if (wholeWord) {
    const regex = new RegExp(`\\b${escapeRegex(searchKeyword)}\\b`, caseSensitive ? '' : 'i')
    return regex.test(text)
  }

  return searchText.includes(searchKeyword)
}

// 转义正则特殊字符
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 根据文本触发Lorebook条目
export async function triggerLorebookEntries(
  text: string,
  lorebookIds: string[],
  options: MatchOptions = {}
): Promise<LorebookEntry[]> {
  const triggered: LorebookEntry[] = []
  const triggeredIds = new Set<string>()

  for (const lorebookId of lorebookIds) {
    const lorebook = await getLorebookById(lorebookId)
    if (!lorebook) continue

    for (const entry of lorebook.entries) {
      if (!entry.enabled) continue
      if (triggeredIds.has(entry.id)) continue

      // 检查关键词匹配
      const isMatch = entry.keys.some(key => matchKeyword(text, key, options))
      if (isMatch) {
        triggered.push(entry)
        triggeredIds.add(entry.id)
      }
    }
  }

  // 按优先级排序（高优先级在前）
  triggered.sort((a, b) => b.priority - a.priority)

  return triggered
}

// 递归触发（检查触发内容是否触发其他条目）
export async function recursiveTrigger(
  initialText: string,
  lorebookIds: string[],
  options: MatchOptions = {},
  maxDepth: number = 3
): Promise<LorebookEntry[]> {
  const allTriggered: LorebookEntry[] = []
  const triggeredIds = new Set<string>()
  let currentText = initialText
  let depth = 0

  while (depth < maxDepth) {
    const newTriggered = await triggerLorebookEntries(currentText, lorebookIds, options)
    const actuallyNew = newTriggered.filter(e => !triggeredIds.has(e.id))

    if (actuallyNew.length === 0) break

    for (const entry of actuallyNew) {
      allTriggered.push(entry)
      triggeredIds.add(entry.id)
    }

    // 将新触发的内容加入搜索文本
    currentText = actuallyNew.map(e => e.content).join(' ')
    depth++
  }

  // 按优先级排序
  allTriggered.sort((a, b) => b.priority - a.priority)

  return allTriggered
}

// 构建Lorebook上下文（带Token限制）
export function buildLorebookContext(
  entries: LorebookEntry[],
  maxTokens: number = 1000
): string {
  const parts: string[] = []
  let estimatedTokens = 0

  for (const entry of entries) {
    // 简单估算Token数
    const entryTokens = Math.ceil(entry.content.length / 2)
    if (estimatedTokens + entryTokens > maxTokens) break

    parts.push(entry.content)
    estimatedTokens += entryTokens
  }

  if (parts.length === 0) return ''

  return `[世界设定]\n${parts.join('\n\n')}`
}
