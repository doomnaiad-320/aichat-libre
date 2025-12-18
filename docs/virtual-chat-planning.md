# 虚拟聊天工具开发规划

基于 LibreChat 项目构建 AI 角色扮演聊天工具

---

## 1. 项目背景

### 1.1 目标
基于 LibreChat 开发一个虚拟聊天/AI角色扮演工具，解决现有工具（如 SillyTavern）的核心痛点。

### 1.2 参考项目
**SillyTavern** (21k+ Stars) - 当前最流行的AI角色扮演聊天工具

### 1.3 核心问题
| 问题 | 描述 | 影响 |
|------|------|------|
| 隐私保护 | 用户数据存储在服务器端，无法保证隐私 | 敏感对话内容泄露风险 |
| 上下文精度 | 对话过长时上下文管理失效，AI丧失精准度 | 角色扮演一致性下降，遗忘关键信息 |

---

## 2. SillyTavern 功能参考

### 2.1 核心功能
| 功能模块 | 说明 |
|----------|------|
| 角色卡系统 | PNG/JSON格式，包含名称、描述、性格、场景、示例对话 |
| 用户人设 | 自定义用户角色身份 |
| 群聊 | 多角色同时对话 |
| 对话分支 | Bookmarks，消息滑动切换 |
| World Info/Lorebook | 关键词触发的上下文注入 |
| Memory Extension | 自动对话摘要 |

### 2.2 技术特点
- 本地文件存储 (JSONL/JSON/PNG)
- 纯JavaScript前端
- Node.js + Express后端
- 支持20+种AI后端API

---

## 3. LibreChat 现有能力

### 3.1 技术栈
| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + TypeScript + Tailwind CSS |
| 后端 | Express 5 + Node.js |
| 数据库 | MongoDB + Mongoose |
| 缓存 | Redis |
| 认证 | Passport.js (JWT/OAuth/LDAP/SAML) |

### 3.2 已有功能
- ✅ 多端点LLM支持 (OpenAI, Claude, Gemini, Bedrock等)
- ✅ Agent系统和市场
- ✅ 文件上传处理
- ✅ 对话管理 (搜索、标签、书签)
- ✅ MCP协议集成
- ✅ 自定义工具
- ✅ Prompt库
- ✅ 多用户认证
- ✅ RBAC权限控制

### 3.3 缺失功能（需开发）
- ❌ 角色卡系统
- ❌ 用户人设管理
- ❌ World Info/Lorebook
- ❌ 智能记忆系统
- ❌ 群聊（多角色对话）
- ❌ 端到端加密
- ❌ 本地优先存储

---

## 4. 解决方案设计

### 4.1 隐私保护方案

#### 方案A: 端到端加密
```
用户端加密 → 传输 → 服务器存储(密文) → 传输 → 用户端解密
```
- 使用 AES-256-GCM 加密聊天内容
- 密钥由用户密码派生 (PBKDF2)
- 服务器仅存储密文

#### 方案B: 本地优先架构
```
IndexedDB/SQLite (本地) ←→ 可选云同步 (加密)
```
- 数据默认存储在浏览器本地
- 可选启用加密云同步
- 支持导出/导入

#### 推荐: 方案B + 方案A混合
- 默认本地存储
- 云同步时启用端到端加密

### 4.2 上下文管理方案

#### 分层记忆架构
```
┌─────────────────────────────────────────┐
│           工作记忆 (Working Memory)      │
│         最近 N 轮对话 (完整内容)          │
├─────────────────────────────────────────┤
│           情景记忆 (Episodic Memory)     │
│      向量检索相关历史 (RAG)              │
├─────────────────────────────────────────┤
│           语义记忆 (Semantic Memory)     │
│    角色/用户画像 + 关键事件摘要           │
├─────────────────────────────────────────┤
│           世界知识 (World Info)          │
│      关键词触发的Lorebook条目            │
└─────────────────────────────────────────┘
```

#### Token分配策略
| 记忆层 | Token占比 | 说明 |
|--------|-----------|------|
| 系统提示 | 10% | 角色设定、规则 |
| 世界知识 | 15% | 触发的Lorebook条目 |
| 语义记忆 | 15% | 画像和摘要 |
| 情景记忆 | 20% | RAG检索结果 |
| 工作记忆 | 40% | 最近对话 |

---

## 5. 功能开发规划

### Phase 1: 角色系统基础
- [ ] 角色卡数据模型 (Character Schema)
- [ ] 角色卡CRUD API
- [ ] 角色卡管理UI
- [ ] 角色卡导入/导出 (兼容SillyTavern格式)
- [ ] 用户人设管理

### Phase 2: 增强对话系统
- [ ] 角色对话模式 (区别于普通聊天)
- [ ] 对话分支和消息滑动
- [ ] 群聊支持 (多角色)
- [ ] 对话场景设定

### Phase 3: 智能记忆系统
- [ ] 向量数据库集成 (本地)
- [ ] 对话自动摘要
- [ ] 角色/用户画像提取
- [ ] RAG检索增强
- [ ] 动态上下文构建

### Phase 4: World Info系统
- [ ] Lorebook数据模型
- [ ] 关键词触发机制
- [ ] 条目管理UI
- [ ] 递归扫描支持

### Phase 5: 隐私增强
- [ ] 本地存储层 (IndexedDB)
- [ ] 端到端加密
- [ ] 加密云同步
- [ ] 数据导出/备份

---

## 6. 数据模型设计

### 6.1 角色卡 (Character)
```typescript
interface Character {
  characterId: string;
  userId: string;

  // 基础信息
  name: string;
  avatar: string;
  description: string;
  personality: string;

  // 对话设定
  scenario: string;
  firstMessage: string;
  exampleDialogue: string[];
  systemPrompt: string;

  // 高级设定
  creatorNotes: string;
  tags: string[];

  // 元数据
  visibility: 'private' | 'public' | 'unlisted';
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.2 用户人设 (Persona)
```typescript
interface Persona {
  personaId: string;
  userId: string;
  name: string;
  description: string;
  avatar: string;
  isDefault: boolean;
}
```

### 6.3 Lorebook条目 (WorldInfo)
```typescript
interface WorldInfoEntry {
  entryId: string;
  lorebookId: string;

  // 触发条件
  keys: string[];           // 主关键词
  secondaryKeys: string[];  // 次要关键词

  // 内容
  content: string;

  // 行为控制
  position: 'before' | 'after' | 'depth';
  depth: number;
  priority: number;

  // 高级选项
  caseSensitive: boolean;
  matchWholeWords: boolean;
  enabled: boolean;
}
```

### 6.4 记忆条目 (Memory)
```typescript
interface MemoryEntry {
  memoryId: string;
  conversationId: string;

  type: 'summary' | 'event' | 'trait' | 'fact';
  content: string;
  embedding: number[];  // 向量

  importance: number;   // 重要性评分
  lastAccessed: Date;
  createdAt: Date;
}
```

---

## 7. API端点规划

### 角色管理
```
GET    /api/characters          # 列表
POST   /api/characters          # 创建
GET    /api/characters/:id      # 详情
PUT    /api/characters/:id      # 更新
DELETE /api/characters/:id      # 删除
POST   /api/characters/import   # 导入
GET    /api/characters/:id/export # 导出
```

### 人设管理
```
GET    /api/personas            # 列表
POST   /api/personas            # 创建
PUT    /api/personas/:id        # 更新
DELETE /api/personas/:id        # 删除
```

### Lorebook管理
```
GET    /api/lorebooks           # 列表
POST   /api/lorebooks           # 创建
GET    /api/lorebooks/:id       # 详情
PUT    /api/lorebooks/:id       # 更新
DELETE /api/lorebooks/:id       # 删除
POST   /api/lorebooks/:id/entries # 添加条目
```

### 记忆系统
```
GET    /api/memory/:conversationId  # 获取记忆
POST   /api/memory/summarize        # 生成摘要
POST   /api/memory/search           # 向量搜索
```

---

## 8. 技术选型

| 需求 | 选型 | 理由 |
|------|------|------|
| 本地向量数据库 | Vectra / LanceDB | 轻量、浏览器兼容 |
| 本地存储 | IndexedDB + Dexie.js | 浏览器原生、容量大 |
| 加密 | Web Crypto API | 浏览器原生、安全 |
| 角色卡格式 | PNG + JSON (V3 ccv3) | 兼容SillyTavern |
| 摘要生成 | 主LLM / 本地小模型 | 灵活选择 |

---

## 9. 开发优先级

### 高优先级 (MVP)
1. 角色卡系统
2. 角色对话模式
3. 基础记忆摘要

### 中优先级
4. World Info/Lorebook
5. 向量RAG检索
6. 群聊支持

### 低优先级
7. 本地优先存储
8. 端到端加密
9. 角色市场

---

## 10. 下一步行动

1. **确认需求优先级** - 与用户确认MVP范围
2. **设计数据模型** - 创建Mongoose Schema
3. **实现角色卡API** - 后端CRUD
4. **开发角色卡UI** - 前端组件
5. **集成对话系统** - 角色对话模式

---

*文档创建时间: 2024-12-18*
*基于: LibreChat + SillyTavern功能分析*
