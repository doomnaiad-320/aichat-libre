import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

export type ProviderConfig = {
  apiKey: string
  baseURL?: string
}

// 创建OpenAI兼容provider (支持OpenAI, DeepSeek, 硅基流动等)
export function createOpenAIProvider(config: ProviderConfig) {
  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
}

// 创建Anthropic provider
export function createAnthropicProvider(config: ProviderConfig) {
  return createAnthropic({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
}

// 根据provider类型创建实例
export function createProvider(type: string, config: ProviderConfig) {
  switch (type) {
    case 'openai':
    case 'deepseek':
    case 'siliconflow':
    case 'openrouter':
      return createOpenAIProvider(config)
    case 'anthropic':
      return createAnthropicProvider(config)
    default:
      // 默认使用OpenAI兼容接口
      return createOpenAIProvider(config)
  }
}
