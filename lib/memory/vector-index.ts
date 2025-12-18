// 纯JS向量索引类 - 用于本地记忆检索

export interface VectorEntry {
  id: string
  vector: number[]
  metadata: Record<string, unknown>
}

export class VectorIndex {
  private entries: VectorEntry[] = []

  // 添加向量
  add(id: string, vector: number[], metadata: Record<string, unknown> = {}): void {
    // 检查是否已存在，存在则更新
    const existingIndex = this.entries.findIndex(e => e.id === id)
    if (existingIndex >= 0) {
      this.entries[existingIndex] = { id, vector, metadata }
    } else {
      this.entries.push({ id, vector, metadata })
    }
  }

  // 批量添加
  addBatch(entries: VectorEntry[]): void {
    for (const entry of entries) {
      this.add(entry.id, entry.vector, entry.metadata)
    }
  }

  // 删除向量
  remove(id: string): boolean {
    const index = this.entries.findIndex(e => e.id === id)
    if (index >= 0) {
      this.entries.splice(index, 1)
      return true
    }
    return false
  }

  // 清空索引
  clear(): void {
    this.entries = []
  }

  // 获取所有条目
  getAll(): VectorEntry[] {
    return [...this.entries]
  }

  // 获取条目数量
  get size(): number {
    return this.entries.length
  }

  // 余弦相似度计算
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension')
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

  // Top-K检索
  search(
    queryVector: number[],
    k: number = 5,
    filter?: (entry: VectorEntry) => boolean
  ): Array<{ entry: VectorEntry; score: number }> {
    let candidates = this.entries

    // 应用过滤器
    if (filter) {
      candidates = candidates.filter(filter)
    }

    // 计算相似度并排序
    const scored = candidates.map(entry => ({
      entry,
      score: this.cosineSimilarity(queryVector, entry.vector)
    }))

    // 按相似度降序排序
    scored.sort((a, b) => b.score - a.score)

    // 返回Top-K
    return scored.slice(0, k)
  }

  // 带阈值的检索
  searchWithThreshold(
    queryVector: number[],
    threshold: number = 0.7,
    maxResults: number = 10,
    filter?: (entry: VectorEntry) => boolean
  ): Array<{ entry: VectorEntry; score: number }> {
    const results = this.search(queryVector, maxResults, filter)
    return results.filter(r => r.score >= threshold)
  }

  // 序列化（用于持久化）
  serialize(): string {
    return JSON.stringify(this.entries)
  }

  // 反序列化
  deserialize(data: string): void {
    try {
      this.entries = JSON.parse(data)
    } catch {
      this.entries = []
    }
  }

  // 从数组加载
  load(entries: VectorEntry[]): void {
    this.entries = [...entries]
  }
}

// 创建默认索引实例
export const defaultVectorIndex = new VectorIndex()
