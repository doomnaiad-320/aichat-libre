// Memory系统导出

export { VectorIndex, type VectorEntry } from './vector-index'
export {
  generateEmbedding,
  generateEmbeddings,
  calculateSimilarity,
  getDefaultEmbeddingConfig,
  type EmbeddingConfig,
  type EmbeddingResult
} from './embeddings'
export {
  MemoryManager,
  memoryManager,
  type MemoryType,
  type MemoryEntry
} from './memory-manager'
export {
  buildContext,
  getTotalTokens,
  defaultContextConfig,
  type ContextConfig,
  type ContextPart
} from './context-builder'
