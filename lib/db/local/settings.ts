import { localDb } from './schema'

export async function getSetting<T>(key: string): Promise<T | null> {
  const setting = await localDb.settings.where('key').equals(key).first()
  return setting ? (setting.value as T) : null
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const existing = await localDb.settings.where('key').equals(key).first()
  if (existing) {
    await localDb.settings.update(existing.id, { value, updatedAt: new Date() })
  } else {
    await localDb.settings.add({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      key,
      value,
      updatedAt: new Date()
    })
  }
}

export async function deleteSetting(key: string): Promise<void> {
  await localDb.settings.where('key').equals(key).delete()
}

// AI Provider配置类型
export type AIProviderConfig = {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'deepseek' | 'siliconflow' | 'openrouter' | 'custom'
  apiKey: string
  baseURL?: string
  models: string[]
  enabled: boolean
}

// 获取所有AI Provider配置
export async function getAIProviders(): Promise<AIProviderConfig[]> {
  return (await getSetting<AIProviderConfig[]>('ai_providers')) || []
}

// 保存AI Provider配置
export async function saveAIProviders(providers: AIProviderConfig[]): Promise<void> {
  await setSetting('ai_providers', providers)
}

// 获取默认Provider
export async function getDefaultProvider(): Promise<{ provider: string; model: string } | null> {
  return getSetting('default_provider')
}

// 设置默认Provider
export async function setDefaultProvider(provider: string, model: string): Promise<void> {
  await setSetting('default_provider', { provider, model })
}
