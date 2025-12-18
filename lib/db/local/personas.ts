import { localDb, type LocalPersona } from './schema'

// 生成唯一ID
function generateId(): string {
  return `persona_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// 获取所有人设
export async function getAllPersonas(): Promise<LocalPersona[]> {
  return localDb.personas.orderBy('createdAt').reverse().toArray()
}

// 获取默认人设
export async function getDefaultPersona(): Promise<LocalPersona | undefined> {
  return localDb.personas.where('isDefault').equals(1).first()
}

// 根据ID获取人设
export async function getPersonaById(id: string): Promise<LocalPersona | undefined> {
  return localDb.personas.get(id)
}

// 创建人设
export async function createPersona(
  data: Omit<LocalPersona, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LocalPersona> {
  const now = new Date()
  const persona: LocalPersona = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }

  // 如果设为默认，清除其他默认
  if (persona.isDefault) {
    await clearDefaultPersona()
  }

  await localDb.personas.add(persona)
  return persona
}

// 更新人设
export async function updatePersona(
  id: string,
  data: Partial<Omit<LocalPersona, 'id' | 'createdAt'>>
): Promise<void> {
  // 如果设为默认，清除其他默认
  if (data.isDefault) {
    await clearDefaultPersona()
  }

  await localDb.personas.update(id, {
    ...data,
    updatedAt: new Date()
  })
}

// 删除人设
export async function deletePersona(id: string): Promise<void> {
  await localDb.personas.delete(id)
}

// 设置默认人设
export async function setDefaultPersona(id: string): Promise<void> {
  await clearDefaultPersona()
  await localDb.personas.update(id, {
    isDefault: true,
    updatedAt: new Date()
  })
}

// 清除默认人设标记
async function clearDefaultPersona(): Promise<void> {
  const defaultPersonas = await localDb.personas.where('isDefault').equals(1).toArray()
  for (const persona of defaultPersonas) {
    await localDb.personas.update(persona.id, {
      isDefault: false,
      updatedAt: new Date()
    })
  }
}

// 构建人设提示词
export function buildPersonaPrompt(persona: LocalPersona): string {
  const parts: string[] = []

  if (persona.name) {
    parts.push(`用户名: ${persona.name}`)
  }

  if (persona.description) {
    parts.push(`用户描述: ${persona.description}`)
  }

  if (persona.personality) {
    parts.push(`用户性格: ${persona.personality}`)
  }

  if (persona.background) {
    parts.push(`用户背景: ${persona.background}`)
  }

  if (parts.length === 0) {
    return ''
  }

  return `[用户人设信息]\n${parts.join('\n')}`
}
