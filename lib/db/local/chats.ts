import { localDb, type LocalChat, type LocalMessage } from './schema'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// 创建聊天会话
export async function createChat(characterId: string, title?: string): Promise<LocalChat> {
  const now = new Date()
  const chat: LocalChat = {
    id: generateId(),
    characterId,
    title: title || `对话 ${now.toLocaleDateString()}`,
    createdAt: now,
    updatedAt: now
  }
  await localDb.chats.add(chat)
  return chat
}

// 获取角色的所有聊天
export async function getChatsByCharacter(characterId: string): Promise<LocalChat[]> {
  return localDb.chats
    .where('characterId')
    .equals(characterId)
    .reverse()
    .sortBy('updatedAt')
}

// 获取聊天详情
export async function getChatById(id: string): Promise<LocalChat | undefined> {
  return localDb.chats.get(id)
}

// 更新聊天
export async function updateChat(id: string, data: Partial<Pick<LocalChat, 'title'>>): Promise<void> {
  await localDb.chats.update(id, {
    ...data,
    updatedAt: new Date()
  })
}

// 删除聊天及其消息
export async function deleteChat(id: string): Promise<void> {
  await localDb.transaction('rw', [localDb.chats, localDb.messages, localDb.workingMemory, localDb.episodicMemory], async () => {
    await localDb.messages.where('chatId').equals(id).delete()
    await localDb.workingMemory.where('chatId').equals(id).delete()
    await localDb.episodicMemory.where('chatId').equals(id).delete()
    await localDb.chats.delete(id)
  })
}

// 添加消息
export async function addMessage(
  chatId: string,
  role: LocalMessage['role'],
  content: string,
  metadata?: LocalMessage['metadata']
): Promise<LocalMessage> {
  const message: LocalMessage = {
    id: generateId(),
    chatId,
    role,
    content,
    metadata,
    createdAt: new Date()
  }
  await localDb.messages.add(message)
  // 更新聊天的updatedAt
  await localDb.chats.update(chatId, { updatedAt: new Date() })
  return message
}

// 获取聊天的所有消息
export async function getMessagesByChat(chatId: string): Promise<LocalMessage[]> {
  return localDb.messages
    .where('chatId')
    .equals(chatId)
    .sortBy('createdAt')
}

// 获取最近N条消息
export async function getRecentMessages(chatId: string, limit: number): Promise<LocalMessage[]> {
  const messages = await localDb.messages
    .where('chatId')
    .equals(chatId)
    .reverse()
    .sortBy('createdAt')
  return messages.slice(0, limit).reverse()
}

// 删除消息
export async function deleteMessage(id: string): Promise<void> {
  await localDb.messages.delete(id)
}

// 更新消息内容 (用于编辑/重新生成)
export async function updateMessage(id: string, content: string, metadata?: LocalMessage['metadata']): Promise<void> {
  const updates: Partial<LocalMessage> = { content }
  if (metadata) {
    updates.metadata = metadata
  }
  await localDb.messages.update(id, updates)
}

// 获取聊天消息数量
export async function getMessageCount(chatId: string): Promise<number> {
  return localDb.messages.where('chatId').equals(chatId).count()
}
