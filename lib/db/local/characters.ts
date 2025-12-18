import { localDb, type LocalCharacter } from './schema'

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// 创建角色卡
export async function createCharacter(
  data: Omit<LocalCharacter, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LocalCharacter> {
  const now = new Date()
  const character: LocalCharacter = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }
  await localDb.characters.add(character)
  return character
}

// 获取所有角色卡
export async function getAllCharacters(): Promise<LocalCharacter[]> {
  return localDb.characters.orderBy('updatedAt').reverse().toArray()
}

// 根据ID获取角色卡
export async function getCharacterById(id: string): Promise<LocalCharacter | undefined> {
  return localDb.characters.get(id)
}

// 更新角色卡
export async function updateCharacter(
  id: string,
  data: Partial<Omit<LocalCharacter, 'id' | 'createdAt'>>
): Promise<void> {
  await localDb.characters.update(id, {
    ...data,
    updatedAt: new Date()
  })
}

// 删除角色卡
export async function deleteCharacter(id: string): Promise<void> {
  await localDb.transaction('rw', [localDb.characters, localDb.chats, localDb.messages, localDb.lorebooks, localDb.semanticMemory], async () => {
    // 删除关联的聊天和消息
    const chats = await localDb.chats.where('characterId').equals(id).toArray()
    for (const chat of chats) {
      await localDb.messages.where('chatId').equals(chat.id).delete()
    }
    await localDb.chats.where('characterId').equals(id).delete()
    // 删除关联的lorebook
    await localDb.lorebooks.where('characterId').equals(id).delete()
    // 删除关联的语义记忆
    await localDb.semanticMemory.where('characterId').equals(id).delete()
    // 删除角色卡
    await localDb.characters.delete(id)
  })
}

// 搜索角色卡
export async function searchCharacters(query: string): Promise<LocalCharacter[]> {
  const lowerQuery = query.toLowerCase()
  return localDb.characters
    .filter(char => {
      if (char.name.toLowerCase().includes(lowerQuery)) return true
      if (char.description?.toLowerCase().includes(lowerQuery)) return true
      if (char.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true
      return false
    })
    .toArray()
}

// 导入SillyTavern角色卡 (PNG或JSON)
export async function importCharacterCard(cardData: Record<string, unknown>): Promise<LocalCharacter> {
  // SillyTavern V2 格式
  const spec = cardData.spec as string | undefined
  const data = (spec === 'chara_card_v2' ? cardData.data : cardData) as Record<string, unknown>

  return createCharacter({
    name: (data.name as string) || 'Unknown',
    avatar: data.avatar as string | undefined,
    description: data.description as string | undefined,
    personality: data.personality as string | undefined,
    scenario: data.scenario as string | undefined,
    firstMessage: (data.first_mes || data.firstMessage) as string | undefined,
    exampleDialogue: (data.mes_example || data.exampleDialogue) as string | undefined,
    tags: data.tags as string[] | undefined,
    cardData: cardData // 保存原始数据
  })
}

// 导出角色卡为SillyTavern V2格式
export function exportCharacterCard(character: LocalCharacter): Record<string, unknown> {
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: character.name,
      avatar: character.avatar,
      description: character.description,
      personality: character.personality,
      scenario: character.scenario,
      first_mes: character.firstMessage,
      mes_example: character.exampleDialogue,
      tags: character.tags,
      creator: 'AIChatLibre',
      character_version: '1.0'
    }
  }
}
