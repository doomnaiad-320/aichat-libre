# 虚拟聊天工具 - 开发计划 TODO

详细的开发任务清单，按阶段划分

---

## 项目信息

- **项目名称**: Virtual Chat (暂定)
- **技术栈**: Next.js 14 + TypeScript + Prisma + @lobehub/ui + shadcn/ui
- **架构**: 全栈单体架构 (路由组分离用户端/管理端)

---

## Phase 0: 项目初始化

### 0.1 项目骨架
- [ ] 创建 Next.js 14 项目 (App Router)
- [ ] 配置 TypeScript 5.x
- [ ] 配置 ESLint + Prettier + Biome
- [ ] 配置 .env 环境变量
- [ ] 创建基础目录结构
  - [ ] `app/(user)/` - 用户端路由组
  - [ ] `app/(admin)/` - 管理端路由组
  - [ ] `app/(auth)/` - 认证路由组
  - [ ] `app/api/` - API Routes
  - [ ] `components/` - 组件目录
  - [ ] `lib/` - 工具库
  - [ ] `stores/` - Zustand stores
  - [ ] `hooks/` - 自定义 Hooks
  - [ ] `types/` - TypeScript 类型

### 0.2 数据库配置
- [ ] 安装 Prisma
- [ ] 配置 PostgreSQL 连接 (Supabase)
- [ ] 创建 Prisma Schema
  - [ ] User 模型
  - [ ] Character 模型
  - [ ] Persona 模型
  - [ ] Conversation 模型 (服务端元数据)
  - [ ] Transaction 模型
  - [ ] AIProvider 模型
- [ ] 运行首次迁移
- [ ] 创建 Prisma Client 封装 (`lib/db/`)

### 0.3 用户端 UI 配置 (@lobehub/ui)
- [ ] 安装 @lobehub/ui
- [ ] 安装 antd + antd-style
- [ ] 安装 framer-motion
- [ ] 配置 ThemeProvider
- [ ] 创建用户端 layout (`app/(user)/layout.tsx`)
- [ ] 测试基础组件渲染

### 0.4 管理端 UI 配置 (shadcn/ui)
- [ ] 克隆 next-shadcn-admin-dashboard 组件
- [ ] 配置 Tailwind CSS v4
- [ ] 配置 shadcn ThemeProvider
- [ ] 创建管理端 layout (`app/(admin)/layout.tsx`)
- [ ] 集成 Sidebar 组件
- [ ] 测试 Dashboard 页面

### 0.5 本地存储配置
- [ ] 安装 Dexie.js
- [ ] 创建本地数据库 Schema
  - [ ] conversations 表
  - [ ] messages 表
  - [ ] characters 表 (本地副本)
  - [ ] personas 表
  - [ ] memories 表
  - [ ] lorebooks 表
- [ ] 创建 Dexie 封装 (`lib/storage/`)
- [ ] 创建本地存储 Hooks

### 0.6 PWA 配置
- [ ] 安装 next-pwa
- [ ] 配置 manifest.json
- [ ] 配置 Service Worker
- [ ] 测试离线访问
- [ ] 测试"添加到主屏幕"

---

## Phase 1: 认证系统

### 1.1 Auth.js 集成
- [ ] 安装 next-auth v5 (Auth.js)
- [ ] 安装 @auth/prisma-adapter
- [ ] 创建 Auth.js 配置 (`lib/auth/`)
- [ ] 配置 JWT Session 策略
- [ ] 创建 auth API route (`app/api/auth/[...nextauth]/`)

### 1.2 认证 Provider
- [ ] 配置 Credentials Provider (邮箱/密码)
  - [ ] 密码加密 (bcrypt)
  - [ ] 登录验证逻辑
- [ ] 配置 Google OAuth
- [ ] 配置 GitHub OAuth
- [ ] 配置 Discord OAuth (可选)

### 1.3 认证页面
- [ ] 创建登录页面 (`app/(auth)/login/`)
  - [ ] 邮箱/密码表单
  - [ ] OAuth 按钮
  - [ ] 记住我选项
- [ ] 创建注册页面 (`app/(auth)/register/`)
  - [ ] 注册表单
  - [ ] 邮箱验证 (可选)
- [ ] 创建忘记密码页面 (`app/(auth)/forgot-password/`)
- [ ] 创建重置密码页面

### 1.4 认证中间件
- [ ] 创建 middleware.ts
- [ ] 配置路由保护
  - [ ] `/chat/*` 需要登录
  - [ ] `/admin/*` 需要管理员权限
- [ ] 创建 useSession Hook
- [ ] 创建 useUser Hook

### 1.5 用户管理 API
- [ ] `GET /api/user` - 获取当前用户
- [ ] `PUT /api/user` - 更新用户信息
- [ ] `PUT /api/user/password` - 修改密码
- [ ] `DELETE /api/user` - 删除账号

---

## Phase 2: AI 对话基础

### 2.1 Vercel AI SDK 集成
- [ ] 安装 ai 包
- [ ] 安装 Provider 包
  - [ ] @ai-sdk/openai
  - [ ] @ai-sdk/anthropic
  - [ ] @ai-sdk/google
- [ ] 创建 AI 封装 (`lib/ai/`)
- [ ] 创建 Provider 配置管理

### 2.2 对话 API
- [ ] `POST /api/chat` - 发送消息 (流式)
  - [ ] 接收消息内容
  - [ ] 构建上下文 (角色设定 + 历史)
  - [ ] 调用 AI SDK
  - [ ] 返回流式响应
- [ ] `POST /api/chat/token-count` - Token 计数
- [ ] 创建 AI 调用中间件 (计费扣费)

### 2.3 对话 UI (用户端)
- [ ] 创建对话页面 (`app/(user)/chat/`)
- [ ] 集成 @lobehub/ui 组件
  - [ ] ChatList 组件
  - [ ] Bubble 组件
  - [ ] ChatInputArea 组件
  - [ ] LoadingDots 组件
- [ ] 实现流式消息渲染
- [ ] 集成 Markdown 组件
- [ ] 集成 Highlighter 代码高亮
- [ ] 实现消息编辑/删除
- [ ] 实现消息重新生成

### 2.4 对话本地存储
- [ ] 创建 useChat Hook
- [ ] 实现消息本地保存 (Dexie)
- [ ] 实现对话列表管理
- [ ] 实现对话搜索
- [ ] 实现对话删除

### 2.5 Token 计数
- [ ] 安装 tiktoken
- [ ] 创建 Token 计数工具
- [ ] 实现实时 Token 显示 (TokenTag)
- [ ] 实现上下文长度限制

---

## Phase 3: 角色卡系统

### 3.1 角色卡数据模型
- [ ] 完善 Prisma Character Schema
- [ ] 创建角色卡 TypeScript 类型
- [ ] 创建角色卡验证 Schema (Zod)

### 3.2 角色卡 API
- [ ] `GET /api/characters` - 获取角色卡列表
- [ ] `POST /api/characters` - 创建角色卡
- [ ] `GET /api/characters/:id` - 获取角色卡详情
- [ ] `PUT /api/characters/:id` - 更新角色卡
- [ ] `DELETE /api/characters/:id` - 删除角色卡
- [ ] `POST /api/characters/import` - 导入角色卡
- [ ] `GET /api/characters/:id/export` - 导出角色卡

### 3.3 角色卡 UI (用户端)
- [ ] 创建角色卡列表页 (`app/(user)/characters/`)
  - [ ] 网格/列表视图切换
  - [ ] 搜索/筛选
  - [ ] 排序选项
- [ ] 创建角色卡详情页 (`app/(user)/characters/[id]/`)
  - [ ] 角色信息展示
  - [ ] 开始对话按钮
  - [ ] 编辑/删除按钮
- [ ] 创建角色卡创建/编辑页 (`app/(user)/characters/create/`)
  - [ ] 基础信息表单 (名称、头像、描述)
  - [ ] 性格设定
  - [ ] 场景设定
  - [ ] 首条消息
  - [ ] 示例对话
  - [ ] 系统提示词
  - [ ] 高级设置

### 3.4 角色卡导入/导出
- [ ] 支持 SillyTavern PNG 格式导入
- [ ] 支持 JSON 格式导入/导出
- [ ] 支持 PNG 元数据导出 (png-chunks)
- [ ] 创建导入向导 UI

### 3.5 角色对话模式
- [ ] 创建角色对话页面 (`app/(user)/chat/[conversationId]/`)
- [ ] 实现角色设定注入
- [ ] 实现首条消息自动发送
- [ ] 实现角色头像/名称显示
- [ ] 实现角色切换

### 3.6 用户人设
- [ ] 创建 Persona API
  - [ ] CRUD 接口
- [ ] 创建人设管理 UI
- [ ] 实现人设切换
- [ ] 实现人设注入对话

---

## Phase 4: 智能记忆系统

### 4.1 向量索引 (本地)
- [ ] 创建纯 JS 向量索引类
  - [ ] 余弦相似度计算
  - [ ] 向量存储 (Dexie)
  - [ ] Top-K 检索
- [ ] 创建向量索引 Hook

### 4.2 Embedding 生成
- [ ] 集成 OpenAI Embeddings API
- [ ] 创建 Embedding 生成工具
- [ ] 实现消息自动 Embedding
- [ ] 实现批量 Embedding

### 4.3 记忆提取
- [ ] 创建记忆提取 Prompt
- [ ] 实现对话摘要生成
- [ ] 实现关键事件提取
- [ ] 实现角色/用户特征提取
- [ ] 创建记忆存储 (Dexie)

### 4.4 RAG 检索
- [ ] 实现相关记忆检索
- [ ] 实现检索结果排序
- [ ] 实现检索结果去重
- [ ] 创建 RAG Hook

### 4.5 动态上下文构建
- [ ] 实现分层记忆架构
  - [ ] 工作记忆 (最近N轮)
  - [ ] 情景记忆 (RAG检索)
  - [ ] 语义记忆 (摘要/画像)
  - [ ] 世界知识 (Lorebook)
- [ ] 实现 Token 预算分配
- [ ] 实现上下文压缩
- [ ] 创建上下文构建器

---

## Phase 5: World Info / Lorebook

### 5.1 Lorebook 数据模型
- [ ] 创建 Lorebook Dexie Schema
- [ ] 创建 LorebookEntry 类型
- [ ] 创建验证 Schema (Zod)

### 5.2 Lorebook 管理 UI
- [ ] 创建 Lorebook 列表页
- [ ] 创建 Lorebook 编辑页
- [ ] 创建条目管理界面
  - [ ] 关键词设置
  - [ ] 内容编辑
  - [ ] 优先级设置
  - [ ] 启用/禁用

### 5.3 关键词触发机制
- [ ] 实现关键词匹配算法
  - [ ] 主关键词匹配
  - [ ] 次要关键词匹配
  - [ ] 大小写敏感选项
  - [ ] 全词匹配选项
- [ ] 实现递归扫描
- [ ] 实现优先级排序
- [ ] 实现 Token 预算控制

### 5.4 Lorebook 注入
- [ ] 实现上下文注入
- [ ] 实现位置控制 (before/after/depth)
- [ ] 集成到上下文构建器

---

## Phase 6: 计费系统

### 6.1 Stripe 集成
- [ ] 安装 stripe + @stripe/stripe-js
- [ ] 创建 Stripe 配置
- [ ] 配置 Webhook 端点

### 6.2 订阅计划
- [ ] 创建订阅计划 (Free/Pro/Premium)
- [ ] 实现 Stripe Checkout
- [ ] 实现订阅管理页面
- [ ] 实现订阅状态检查

### 6.3 Token 计费
- [ ] 创建 Transaction 记录
- [ ] 实现 Token 消费追踪
- [ ] 实现余额检查中间件
- [ ] 实现余额不足提示

### 6.4 充值系统
- [ ] 实现 Token 充值页面
- [ ] 实现充值套餐
- [ ] 实现支付成功回调
- [ ] 实现充值记录

### 6.5 用量统计
- [ ] 创建用量统计 API
- [ ] 实现用量图表 (用户端)
- [ ] 实现消费明细

---

## Phase 7: 角色卡社区

### 7.1 社区 API
- [ ] `GET /api/community/characters` - 公开角色卡列表
- [ ] `GET /api/community/characters/:id` - 公开角色卡详情
- [ ] `POST /api/community/characters/:id/like` - 点赞
- [ ] `POST /api/community/characters/:id/download` - 下载
- [ ] `GET /api/community/characters/trending` - 热门角色卡
- [ ] `GET /api/community/characters/new` - 最新角色卡

### 7.2 社区 UI (用户端)
- [ ] 创建社区首页 (`app/(user)/community/`)
  - [ ] 热门角色卡
  - [ ] 最新角色卡
  - [ ] 分类浏览
- [ ] 创建探索页面 (`app/(user)/community/explore/`)
  - [ ] 搜索功能
  - [ ] 标签筛选
  - [ ] 排序选项
- [ ] 创建角色卡详情页 (社区版)
  - [ ] 下载按钮
  - [ ] 点赞按钮
  - [ ] 创作者信息

### 7.3 角色卡发布
- [ ] 实现发布到社区功能
- [ ] 实现可见性设置 (私有/公开/未列出)
- [ ] 实现标签管理
- [ ] 实现封面图上传

### 7.4 社交功能
- [ ] 实现收藏功能
- [ ] 实现关注创作者
- [ ] 实现评论系统 (可选)

---

## Phase 8: 管理后台

### 8.1 Dashboard
- [ ] 集成 next-shadcn-admin-dashboard
- [ ] 创建管理后台首页
- [ ] 实现数据概览卡片
  - [ ] 用户总数
  - [ ] 今日活跃
  - [ ] 对话数量
  - [ ] 收入统计
- [ ] 实现趋势图表

### 8.2 用户管理
- [ ] 创建用户列表页 (`app/(admin)/users/`)
  - [ ] 用户表格 (TanStack Table)
  - [ ] 搜索/筛选
  - [ ] 分页
- [ ] 创建用户详情页
  - [ ] 用户信息
  - [ ] 消费记录
  - [ ] 角色卡列表
- [ ] 实现用户操作
  - [ ] 封禁/解封
  - [ ] 调整余额
  - [ ] 重置密码

### 8.3 角色卡审核
- [ ] 创建审核列表页 (`app/(admin)/characters/`)
  - [ ] 待审核列表
  - [ ] 已通过列表
  - [ ] 已拒绝列表
- [ ] 实现审核操作
  - [ ] 通过
  - [ ] 拒绝 (附原因)
  - [ ] 下架

### 8.4 AI 服务商配置
- [ ] 创建服务商列表页 (`app/(admin)/providers/`)
- [ ] 实现服务商配置
  - [ ] API Key 管理
  - [ ] 模型列表
  - [ ] 启用/禁用
  - [ ] 价格配置
- [ ] 实现服务商测试

### 8.5 计费统计
- [ ] 创建计费统计页 (`app/(admin)/billing/`)
- [ ] 实现收入报表
  - [ ] 日/周/月统计
  - [ ] 趋势图表
- [ ] 实现消费明细
- [ ] 实现导出功能

### 8.6 系统设置
- [ ] 创建系统设置页 (`app/(admin)/settings/`)
- [ ] 实现全局配置
  - [ ] 站点名称/Logo
  - [ ] 注册开关
  - [ ] 默认配额
- [ ] 实现公告管理

---

## Phase 9: 隐私增强

### 9.1 端到端加密
- [ ] 安装 libsodium-wrappers
- [ ] 实现密钥派生 (PBKDF2)
- [ ] 实现消息加密/解密
- [ ] 实现本地密钥存储

### 9.2 加密云备份 (可选)
- [ ] 设计加密备份协议
- [ ] 实现备份上传
- [ ] 实现备份下载/恢复
- [ ] 实现备份管理 UI

### 9.3 数据导出
- [ ] 实现完整数据导出
  - [ ] 对话记录
  - [ ] 角色卡
  - [ ] 人设
  - [ ] 记忆
- [ ] 支持 JSON 格式
- [ ] 支持加密导出

### 9.4 数据导入
- [ ] 实现数据导入
- [ ] 实现冲突处理
- [ ] 实现导入向导

---

## Phase 10: 移动端优化

### 10.1 响应式适配
- [ ] 优化用户端移动端布局
- [ ] 优化管理端移动端布局
- [ ] 测试各尺寸屏幕

### 10.2 PWA 增强
- [ ] 优化离线体验
- [ ] 实现后台同步
- [ ] 实现推送通知 (可选)

### 10.3 Capacitor 打包 (可选)
- [ ] 安装 Capacitor
- [ ] 配置 iOS 项目
- [ ] 配置 Android 项目
- [ ] 测试原生功能
- [ ] 准备应用商店上架

---

## Phase 11: 测试与部署

### 11.1 测试
- [ ] 配置 Vitest
- [ ] 编写单元测试
  - [ ] 工具函数测试
  - [ ] Hook 测试
  - [ ] API 测试
- [ ] 配置 Playwright
- [ ] 编写 E2E 测试
  - [ ] 认证流程
  - [ ] 对话流程
  - [ ] 角色卡流程

### 11.2 性能优化
- [ ] 实现代码分割
- [ ] 优化 Bundle Size
- [ ] 实现图片优化
- [ ] 实现缓存策略

### 11.3 部署
- [ ] 配置 Vercel 部署
- [ ] 配置环境变量
- [ ] 配置域名
- [ ] 配置 CDN

### 11.4 监控
- [ ] 集成 Sentry 错误追踪
- [ ] 配置日志收集
- [ ] 配置性能监控

---

## 里程碑

| 里程碑 | 包含 Phase | 目标 |
|--------|-----------|------|
| **M1: MVP** | 0-3 | 基础对话 + 角色卡 |
| **M2: 智能化** | 4-5 | 记忆系统 + Lorebook |
| **M3: 商业化** | 6-7 | 计费 + 社区 |
| **M4: 管理** | 8 | 管理后台 |
| **M5: 安全** | 9 | 隐私增强 |
| **M6: 移动** | 10 | 移动端优化 |
| **M7: 上线** | 11 | 测试部署 |

---

## 优先级说明

- **P0 (必须)**: Phase 0-3 (MVP核心功能)
- **P1 (重要)**: Phase 4-6 (差异化功能)
- **P2 (增强)**: Phase 7-8 (社区和管理)
- **P3 (可选)**: Phase 9-10 (隐私和移动)

---

*文档创建时间: 2024-12-18*
*最后更新: 2024-12-18*
