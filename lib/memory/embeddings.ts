// Embedding生成工具 - 支持多种Provider

export interface EmbeddingConfig {
  provider: 'openai' | 'openai-compatible'
  apiKey: string
  baseURL?: string
  model?: string
}

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

// OpenAI兼容的Embedding API调用
async function callEmbeddingAPI(
  config: EmbeddingConfig,
  input: string | string[]
): Promise<EmbeddingResult[]> {
  const baseURL = config.baseURL || 'https://api.openai.com/v1'
  const model = config.model || 'text-embedding-3-small'

  const response = await fetch(`${baseURL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model,
      input: Array.isArray(input) ? input : [input]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Embedding API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return data.data.map((item: { embedding: number[]; index: number }) => ({
    embedding: item.embedding,
    tokens: data.usage?.prompt_tokens || 0
  }))
}

// 生成单个文本的Embedding
export async function generateEmbedding(
  text: string,
  config: EmbeddingConfig
): Promise<EmbeddingResult> {
  const results = await callEmbeddingAPI(config, text)
  return results[0]
}

// 批量生成Embedding
export async function generateEmbeddings(
  texts: string[],
  config: EmbeddingConfig,
  batchSize: number = 100
): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = []

  // 分批处理
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const batchResults = await callEmbeddingAPI(config, batch)
    results.push(...batchResults)
  }

  return results
}

// 计算两个Embedding的相似度
export function calculateSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimension')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0

  return dotProduct / denominator
}

// 默认配置（从设置中读取）
export function getDefaultEmbeddingConfig(
  apiKey: string,
  baseURL?: string
): EmbeddingConfig {
  return {
    provider: baseURL ? 'openai-compatible' : 'openai',
    apiKey,
    baseURL,
    model: 'text-embedding-3-small'
  }
}
