# 虚拟聊天工具 - SDK组装架构规划

从零构建，采用最佳开源SDK组装

---

## 1. 项目概述

### 1.1 核心目标
构建一个AI角色扮演聊天平台，解决：
- 用户隐私保护
- 长对话上下文精度
- 角色卡社区生态
- 多AI服务商管理
- 用户计费系统

### 1.2 技术原则
- 优先采用成熟开源SDK
- 模块化架构，易于替换
- 本地优先，可选云同步
- TypeScript全栈

---

## 2. SDK选型清单

### 2.1 核心框架

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| 全栈框架 | **Next.js 14+** | Nuxt.js | 128k | App Router, RSC, 服务端渲染 |
| 包管理 | **pnpm** | bun | - | Monorepo支持好 |
| 语言 | **TypeScript 5.x** | - | - | 类型安全 |

### 2.2 AI对话层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| AI SDK | **Vercel AI SDK** | LangChain.js | 10k+ | 流式响应、多provider |
| Token计数 | **tiktoken** | gpt-tokenizer | 11k | OpenAI官方tokenizer |
| Prompt模板 | **Handlebars** | Mustache | 18k | 模板引擎 |

**Vercel AI SDK 支持的Provider:**
- OpenAI / Azure OpenAI
- Anthropic (Claude)
- Google (Gemini)
- AWS Bedrock
- Mistral
- Cohere
- Ollama (本地)
- OpenRouter
- 自定义OpenAI兼容

### 2.3 记忆/RAG层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| 向量数据库(云) | **Pinecone** | Qdrant, Weaviate | - | 托管服务，免费额度 |
| 向量数据库(本地) | **LanceDB** | Chroma, Vectra | 5k+ | 嵌入式，零配置 |
| 向量数据库(浏览器) | **Vectra** | - | 1k+ | IndexedDB存储 |
| Embedding | **OpenAI Embeddings** | Cohere, 本地模型 | - | text-embedding-3-small |
| RAG框架 | **LlamaIndex.TS** | LangChain.js | 2k+ | 专注RAG，更轻量 |

### 2.4 数据库层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| ORM | **Prisma** | Drizzle ORM | 40k | 类型安全，迁移工具 |
| 数据库 | **MySQL 8.0+** | - | - | 自建部署，JSON支持 |
| 本地存储 | **Dexie.js** | localForage | 11k | IndexedDB封装 |
| 缓存 | **Redis** | - | - | 自建部署 (规模大时加) |

**服务器存储 (MySQL):**
- 用户账号/认证
- AI服务商配置
- 公开角色卡/Prompt (社区分享)
- 计费/交易记录
- 用量统计

**用户本地存储 (IndexedDB):**
- 对话记录
- 私有角色卡
- 人设
- 记忆/向量
- Lorebook

### 2.5 认证层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| 认证框架 | **Auth.js (NextAuth v5)** | Clerk, Lucia | 25k | 开源，多provider |
| 密码加密 | **bcrypt** | argon2 | - | 行业标准 |
| JWT | **jose** | jsonwebtoken | 6k | Edge兼容 |

**Auth.js 支持的Provider:**
- Email/Password
- Google, GitHub, Discord, Apple
- OIDC (通用)
- SAML (企业)
- Credentials (自定义)

### 2.6 计费层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| 支付 | **Stripe** | Paddle, LemonSqueezy | - | 最成熟，订阅支持 |
| Stripe SDK | **@stripe/stripe-js** | - | - | 官方SDK |
| 用量计费 | **Stripe Metered Billing** | 自建 | - | 按量计费 |

### 2.7 文件存储层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| 对象存储 | **Cloudflare R2** | AWS S3, Supabase Storage | - | S3兼容，免出口费 |
| 上传组件 | **UploadThing** | Filepond | 4k+ | Next.js集成好 |
| 图片处理 | **Sharp** | Jimp | 29k | 高性能 |

### 2.8 前端UI层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| UI组件库 | **@lobehub/ui** | shadcn/ui | 1.6k | AI聊天专用，开箱即用 |
| 基础组件 | **Ant Design 5.x** | - | 93k | Lobe UI底层依赖 |
| 样式 | **antd-style** | CSS-in-JS | - | Ant Design样式方案 |
| 图标 | **Lucide React** | @lobehub/icons | 12k | 开源图标 |
| 动画 | **Framer Motion** | React Spring | 25k | 声明式动画 |
| 代码高亮 | **Shiki** | Prism | 10k+ | 流式代码高亮 |
| Markdown | **react-markdown** | - | 13k | Markdown渲染 |
| 表单 | **React Hook Form** | Formik | 42k | 性能好 |
| 验证 | **Zod** | Yup | 35k | TypeScript优先 |
| 状态管理 | **Zustand** | Jotai, Recoil | 50k | 轻量，简单 |
| 数据请求 | **TanStack Query** | SWR | 43k | 缓存，乐观更新 |
| 虚拟列表 | **TanStack Virtual** | react-window | 6k | 大列表性能 |

**Lobe UI 核心聊天组件:**
- `ChatList` / `ChatItem` / `Bubble` - 对话列表和消息气泡
- `ChatInputArea` / `MessageInput` - 聊天输入框
- `Markdown` - 完整Markdown渲染 (数学公式、Mermaid图表)
- `Highlighter` - 流式代码高亮 (Shiki)
- `EditableMessage` - 可编辑消息
- `TokenTag` - Token计数标签
- `LoadingDots` - 流式输出动画

**移动端组件:**
- `ChatHeader` (mobile) - 移动端聊天头部
- `TabBar` - 底部导航栏
- `SafeArea` - 安全区域适配

### 2.9 管理后台UI层

| 模块 | SDK选型 | 说明 |
|------|---------|------|
| 后台模板 | **next-shadcn-admin-dashboard** | 现代化Admin模板 |
| UI组件 | **shadcn/ui + Radix UI** | 53+组件 |
| 样式 | **Tailwind CSS v4** | 原子化CSS |
| 数据表格 | **TanStack Table** | 复杂表格 |
| 图表 | **Recharts** | 数据可视化 |

**已有页面:**
- Dashboard (默认/CRM/财务)
- 认证页面 (登录/注册 v1/v2)
- 数据表格 + 交互式图表
- 主题切换 (light/dark + 多配色)

**需开发页面:**
- 用户管理 (列表/详情/封禁)
- AI服务商配置 (API Key/模型/额度)
- 角色卡审核 (社区内容审核)
- 计费统计 (Token消费/收入报表)
- 系统设置 (全局配置)

**架构分离:**
```
用户端 (C端): @lobehub/ui + Ant Design → AI聊天、角色卡、社区
管理后台 (B端): shadcn/ui + Tailwind → 用户管理、计费、审核
```

### 2.10 实时通信层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| WebSocket | **Socket.io** | Pusher, Ably | 62k | 自托管 |
| 实时数据库 | **Supabase Realtime** | Firebase | - | PostgreSQL变更订阅 |

### 2.10 安全/加密层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| 加密 | **Web Crypto API** | crypto-js | - | 浏览器原生 |
| E2E加密 | **libsodium.js** | tweetnacl | 500+ | NaCl封装 |
| 密钥派生 | **PBKDF2 (Web Crypto)** | scrypt | - | 密码派生密钥 |

### 2.11 开发工具层

| 模块 | SDK选型 | 说明 |
|------|---------|------|
| 代码规范 | **ESLint + Prettier** | 代码质量 |
| 测试 | **Vitest + Playwright** | 单元+E2E |
| API文档 | **Swagger/OpenAPI** | API文档 |
| 日志 | **Pino** | 高性能日志 |
| 监控 | **Sentry** | 错误追踪 |

### 2.12 部署层

| 模块 | SDK选型 | 备选 | 说明 |
|------|---------|------|------|
| 托管 | **Vercel** | Cloudflare Pages | Next.js最佳 |
| 容器 | **Docker** | - | 自托管选项 |
| CI/CD | **GitHub Actions** | - | 自动化 |

---

### 2.13 跨平台层

| 模块 | SDK选型 | 备选 | Stars | 说明 |
|------|---------|------|-------|------|
| PWA | **next-pwa** | - | 6k | 渐进式Web应用 |
| 移动打包 | **Capacitor** | React Native | 12k | Web转原生App |
| 本地存储 | **Dexie.js** | - | 11k | IndexedDB，跨平台通用 |

**跨平台策略:**
- Phase 1: Web + PWA (立即可用，可安装到手机主屏幕)
- Phase 2: Capacitor打包 (上架App Store / Google Play)

---

## 3. 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端 (Next.js)                          │
├─────────────────────────────────────────────────────────────────┤
│  @lobehub/ui + Ant Design │ Zustand │ TanStack Query │ Dexie.js │
│  (AI聊天UI)                │ (状态)  │ (数据请求)      │ (本地存储) │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API层 (Next.js API Routes)                   │
├─────────────────────────────────────────────────────────────────┤
│  Auth.js │ Vercel AI SDK │ Stripe │ UploadThing │ Zod          │
│  (认证)   │ (AI对话)       │ (计费)  │ (文件上传)   │ (验证)      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        数据层                                    │
├──────────────────┬──────────────────┬───────────────────────────┤
│   PostgreSQL     │    LanceDB       │    Cloudflare R2          │
│   (Prisma ORM)   │    (向量存储)     │    (文件存储)              │
│   via Supabase   │                  │                           │
└──────────────────┴──────────────────┴───────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI服务商 (Vercel AI SDK)                    │
├─────────┬─────────┬─────────┬─────────┬─────────┬───────────────┤
│ OpenAI  │ Claude  │ Gemini  │ Bedrock │ Mistral │ Ollama(本地)  │
└─────────┴─────────┴─────────┴─────────┴─────────┴───────────────┘
```

---

## 4. 核心功能模块映射

### 4.1 角色卡系统
```
SDK组合:
├── 数据存储: Prisma + PostgreSQL
├── 图片处理: Sharp + Cloudflare R2
├── 导入导出: PNG元数据 (png-chunks)
└── 本地缓存: Dexie.js
```

### 4.2 智能记忆系统
```
SDK组合:
├── 向量存储: LanceDB (服务端) / Vectra (浏览器)
├── Embedding: OpenAI text-embedding-3-small
├── RAG检索: LlamaIndex.TS
├── 摘要生成: Vercel AI SDK
└── 本地缓存: Dexie.js + IndexedDB
```

### 4.3 对话系统
```
SDK组合:
├── AI调用: Vercel AI SDK (流式)
├── Token计数: tiktoken
├── 上下文构建: 自定义 (分层记忆)
├── 消息存储: Dexie.js (本地IndexedDB) ⭐ 隐私优先
├── UI组件: @lobehub/ui (ChatList, Bubble, MessageInput)
└── 流式渲染: Markdown + Highlighter (Shiki)
```

### 4.4 用户认证
```
SDK组合:
├── 认证框架: Auth.js v5
├── OAuth: Google, GitHub, Discord
├── 密码: bcrypt + Credentials Provider
├── Session: JWT (jose)
└── 2FA: otplib (可选)
```

### 4.5 计费系统
```
SDK组合:
├── 支付: Stripe Checkout
├── 订阅: Stripe Subscriptions
├── 用量计费: Stripe Metered Billing
├── Webhook: Stripe Webhooks
└── 用量追踪: 自定义 (Prisma)
```

### 4.6 角色卡社区
```
SDK组合:
├── 列表/搜索: Prisma + PostgreSQL (全文搜索)
├── 分页: TanStack Query (无限滚动)
├── 点赞/收藏: Prisma
├── 评论: Prisma
└── 举报/审核: 自定义
```

### 4.7 隐私保护 (本地优先架构)
```
数据分布:
├── 服务器存储:
│   ├── 用户账号/认证
│   ├── Token余额/交易记录
│   ├── AI服务商配置
│   └── 公开角色卡 (社区分享)
│
└── 用户本地存储 (IndexedDB): ⭐ 隐私核心
    ├── 对话记录
    ├── 私有角色卡
    ├── 用户人设
    ├── 记忆/向量索引
    └── Lorebook

SDK组合:
├── 本地存储: Dexie.js (IndexedDB)
├── 向量索引: 自建纯JS (余弦相似度)
├── 端到端加密: libsodium.js
├── 密钥派生: Web Crypto API (PBKDF2)
├── 加密云备份: 可选，用户控制
└── 数据导出: JSON + 加密
```

---

## 5. 项目结构 (全栈单体架构)

```
virtual-chat/
├── app/                           # Next.js App Router
│   ├── (user)/                    # 用户端 - @lobehub/ui
│   │   ├── chat/                  # AI对话
│   │   │   ├── [conversationId]/
│   │   │   └── page.tsx
│   │   ├── characters/            # 角色卡
│   │   │   ├── [id]/
│   │   │   ├── create/
│   │   │   └── page.tsx
│   │   ├── community/             # 社区
│   │   │   ├── explore/
│   │   │   └── page.tsx
│   │   ├── settings/              # 用户设置
│   │   ├── layout.tsx             # Lobe UI Provider
│   │   └── page.tsx               # 用户首页
│   │
│   ├── (admin)/                   # 管理后台 - shadcn/ui
│   │   ├── dashboard/             # 仪表盘
│   │   ├── users/                 # 用户管理
│   │   ├── characters/            # 角色卡审核
│   │   ├── providers/             # AI服务商配置
│   │   ├── billing/               # 计费统计
│   │   ├── settings/              # 系统设置
│   │   ├── layout.tsx             # shadcn Provider
│   │   └── page.tsx               # 管理首页
│   │
│   ├── (auth)/                    # 认证页面 (共享)
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── layout.tsx
│   │
│   ├── api/                       # API Routes (共享)
│   │   ├── auth/                  # Auth.js
│   │   ├── chat/                  # 对话API
│   │   ├── characters/            # 角色卡API
│   │   ├── community/             # 社区API
│   │   ├── admin/                 # 管理API
│   │   ├── billing/               # 计费API
│   │   └── webhooks/              # Stripe等Webhook
│   │
│   ├── layout.tsx                 # 根布局
│   └── page.tsx                   # 落地页
│
├── components/                    # 共享组件
│   ├── user/                      # 用户端组件 (Lobe UI)
│   │   ├── chat/
│   │   ├── character/
│   │   └── common/
│   ├── admin/                     # 管理端组件 (shadcn)
│   │   ├── dashboard/
│   │   ├── tables/
│   │   └── common/
│   └── shared/                    # 通用组件
│
├── lib/                           # 工具库
│   ├── db/                        # Prisma Client
│   ├── ai/                        # AI SDK封装
│   ├── auth/                      # Auth.js配置
│   ├── storage/                   # 本地存储 (Dexie)
│   ├── memory/                    # 记忆系统
│   ├── crypto/                    # 加密工具
│   └── utils/                     # 通用工具
│
├── stores/                        # Zustand Stores
│   ├── chat.ts
│   ├── character.ts
│   ├── user.ts
│   └── admin.ts
│
├── hooks/                         # 自定义Hooks
│   ├── use-chat.ts
│   ├── use-character.ts
│   ├── use-local-storage.ts
│   └── use-memory.ts
│
├── types/                         # TypeScript类型
│   ├── chat.ts
│   ├── character.ts
│   ├── user.ts
│   └── api.ts
│
├── prisma/                        # 数据库
│   ├── schema.prisma
│   └── migrations/
│
├── public/                        # 静态资源
├── docker/                        # Docker配置
├── .env.example
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**架构说明:**
- 单一Next.js应用，路由组分离用户端和管理端
- `(user)` 使用 @lobehub/ui + Ant Design
- `(admin)` 使用 shadcn/ui + Tailwind
- `api/` 共享API，避免重复
- 认证系统统一 (Auth.js)
- 部署简单 (Vercel一键部署)

---

## 6. 数据模型 (Prisma Schema)

```prisma
// 用户
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  password      String?   // 本地认证
  balance       Int       @default(0) // Token余额

  // 关联
  characters    Character[]
  personas      Persona[]
  conversations Conversation[]
  transactions  Transaction[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 角色卡
model Character {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])

  name          String
  avatar        String?
  description   String    @db.Text
  personality   String    @db.Text
  scenario      String?   @db.Text
  firstMessage  String?   @db.Text
  exampleDialog String?   @db.Text
  systemPrompt  String?   @db.Text

  // 社区
  visibility    Visibility @default(PRIVATE)
  likes         Int       @default(0)
  downloads     Int       @default(0)
  tags          String[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([visibility, likes])
}

// 用户人设
model Persona {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  name        String
  description String   @db.Text
  avatar      String?
  isDefault   Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// 对话
model Conversation {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  characterId String?
  personaId   String?

  title       String?
  summary     String?   @db.Text

  messages    Message[]
  memories    Memory[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
}

// 消息
model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  role           Role
  content        String       @db.Text
  tokenCount     Int?

  createdAt      DateTime     @default(now())

  @@index([conversationId])
}

// 记忆
model Memory {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  type           MemoryType
  content        String       @db.Text
  embedding      Float[]      // 向量
  importance     Float        @default(0.5)

  createdAt      DateTime     @default(now())
  lastAccessed   DateTime     @default(now())

  @@index([conversationId])
}

// Lorebook
model Lorebook {
  id          String          @id @default(cuid())
  userId      String
  name        String
  description String?
  entries     LorebookEntry[]

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model LorebookEntry {
  id          String   @id @default(cuid())
  lorebookId  String
  lorebook    Lorebook @relation(fields: [lorebookId], references: [id], onDelete: Cascade)

  keys        String[] // 触发关键词
  content     String   @db.Text
  priority    Int      @default(0)
  enabled     Boolean  @default(true)

  @@index([lorebookId])
}

// 交易记录
model Transaction {
  id        String          @id @default(cuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id])

  type      TransactionType
  amount    Int             // Token数量
  model     String?         // 使用的模型

  createdAt DateTime        @default(now())

  @@index([userId])
}

// AI服务商配置
model AIProvider {
  id        String   @id @default(cuid())
  name      String   @unique
  baseUrl   String?
  apiKey    String   // 加密存储
  models    String[] // 支持的模型
  enabled   Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 枚举
enum Visibility {
  PRIVATE
  PUBLIC
  UNLISTED
}

enum Role {
  USER
  ASSISTANT
  SYSTEM
}

enum MemoryType {
  SUMMARY
  EVENT
  TRAIT
  FACT
}

enum TransactionType {
  SPEND
  REFUND
  PURCHASE
  GRANT
}
```

---

## 7. 开发阶段规划

> 详细任务清单请参考: [development-todo.md](./development-todo.md)

### Phase 0: 项目初始化
- [ ] 创建 Next.js 14 项目 (全栈单体架构)
- [ ] 配置目录结构 (user/admin/auth 路由组)
- [ ] 配置 Prisma + PostgreSQL (Supabase)
- [ ] 配置用户端 UI (@lobehub/ui + Ant Design)
- [ ] 配置管理端 UI (shadcn/ui + Tailwind)
- [ ] 配置本地存储 (Dexie.js)
- [ ] 配置 PWA (next-pwa)

### Phase 1: 认证系统
- [ ] 集成 Auth.js v5
- [ ] Email/Password + OAuth 认证
- [ ] 认证页面 (登录/注册/忘记密码)
- [ ] 路由保护中间件

### Phase 2: AI对话基础
- [ ] 集成 Vercel AI SDK
- [ ] 多 Provider 支持
- [ ] 流式响应 UI (@lobehub/ui)
- [ ] 对话本地存储 (Dexie.js)
- [ ] Token 计数

### Phase 3: 角色卡系统
- [ ] 角色卡 CRUD API
- [ ] 角色卡管理 UI
- [ ] 导入/导出 (SillyTavern兼容)
- [ ] 角色对话模式
- [ ] 用户人设管理

### Phase 4: 智能记忆系统
- [ ] 本地向量索引 (纯JS)
- [ ] Embedding 生成
- [ ] RAG 检索
- [ ] 自动摘要
- [ ] 分层上下文构建

### Phase 5: World Info / Lorebook
- [ ] Lorebook 数据模型
- [ ] 关键词触发机制
- [ ] Lorebook 管理 UI
- [ ] 上下文注入

### Phase 6: 计费系统
- [ ] Stripe 集成
- [ ] 订阅计划
- [ ] Token 消费追踪
- [ ] 充值系统
- [ ] 用量统计

### Phase 7: 角色卡社区
- [ ] 社区 API
- [ ] 社区浏览 UI
- [ ] 点赞/收藏/下载
- [ ] 角色卡发布

### Phase 8: 管理后台
- [ ] Dashboard 仪表盘
- [ ] 用户管理
- [ ] 角色卡审核
- [ ] AI服务商配置
- [ ] 计费统计
- [ ] 系统设置

### Phase 9: 隐私增强
- [ ] 端到端加密
- [ ] 加密云备份 (可选)
- [ ] 数据导出/导入

### Phase 10: 移动端优化
- [ ] 响应式适配
- [ ] PWA 增强
- [ ] Capacitor 打包 (可选)

### Phase 11: 测试与部署
- [ ] 单元测试 (Vitest)
- [ ] E2E 测试 (Playwright)
- [ ] 性能优化
- [ ] Vercel 部署
- [ ] 监控集成 (Sentry)

---

## 8. 关键依赖版本

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",

    "@auth/prisma-adapter": "^2.0.0",
    "next-auth": "^5.0.0-beta",

    "ai": "^3.4.0",
    "@ai-sdk/openai": "^0.0.60",
    "@ai-sdk/anthropic": "^0.0.50",
    "@ai-sdk/google": "^0.0.50",

    "@prisma/client": "^5.20.0",
    "prisma": "^5.20.0",

    "stripe": "^16.0.0",
    "@stripe/stripe-js": "^4.0.0",

    "llamaindex": "^0.6.0",
    "tiktoken": "^1.0.16",

    "dexie": "^4.0.0",
    "libsodium-wrappers": "^0.7.15",

    "@lobehub/ui": "^2.24.0",
    "antd": "^5.22.0",
    "antd-style": "^3.7.0",
    "shiki": "^3.0.0",
    "react-markdown": "^9.0.0",
    "rehype-katex": "^7.0.0",
    "remark-math": "^6.0.0",
    "mermaid": "^11.0.0",

    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.50.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",

    "framer-motion": "^12.0.0",
    "lucide-react": "^0.400.0",

    "@capacitor/core": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "next-pwa": "^5.6.0"
  }
}
```

---

## 9. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Vercel AI SDK不支持某Provider | 中 | 自定义Provider适配器 |
| LanceDB性能问题 | 中 | 可切换到Pinecone云服务 |
| Auth.js v5 Beta不稳定 | 低 | 回退到v4或使用Lucia |
| Stripe在某些地区不可用 | 中 | 添加Paddle/LemonSqueezy备选 |

---

## 10. 下一步行动

1. **确认SDK选型** - 是否有需要调整的SDK
2. **创建项目骨架** - 初始化Monorepo
3. **实现认证系统** - Auth.js集成
4. **实现AI对话** - Vercel AI SDK集成

---

*文档创建时间: 2024-12-18*
*最后更新: 2024-12-18*
*架构方案: SDK组装 (从零构建)*
*UI方案: @lobehub/ui (AI聊天专用组件库)*
*跨平台: Next.js + PWA + Capacitor*
*隐私策略: 用户数据100%本地存储 (IndexedDB)*
