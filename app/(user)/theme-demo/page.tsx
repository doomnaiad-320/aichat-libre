// 主题演示页面

'use client'

import { 
  Card, 
  Button, 
  Avatar, 
  Badge,
  UserCard,
  StatsCard,
  MessageBubble,
  useTheme 
} from '@/components/ui'

export default function ThemeDemoPage() {
  const { themeVariant } = useTheme()

  const mockMessages = [
    {
      id: '1',
      content: '你好！欢迎使用 AIChatLibre 主题系统',
      isUser: false,
      name: 'AI助手',
      timestamp: '10:30'
    },
    {
      id: '2', 
      content: '这个新的主题系统看起来很棒！',
      isUser: true,
      name: '用户',
      timestamp: '10:31'
    }
  ]

  const mockStats = [
    {
      title: '总对话数',
      value: '1,234',
      subtitle: '本月新增 +123',
      icon: <span>💬</span>,
      trend: { value: 12, label: '较上月' }
    },
    {
      title: '角色卡数量',
      value: '56',
      subtitle: '已创建角色',
      icon: <span>🎭</span>,
      trend: { value: 8, label: '本周' }
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          主题系统演示
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          当前主题: <span className="font-medium">{themeVariant}</span>
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
        <StatsCard
          title="主题风格"
          value={themeVariant}
          subtitle="当前使用"
          icon={<span>🎨</span>}
        />
        <StatsCard
          title="用户体验"
          value="优秀"
          subtitle="视觉友好"
          icon={<span>✨</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 组件展示 */}
        <div className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
              按钮样式
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">默认按钮</Button>
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="soft">柔和按钮</Button>
              <Button variant="outline">边框按钮</Button>
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
              头像和徽章
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar fallback="A" size="sm" />
                <Avatar fallback="B" size="md" variant="ring" />
                <Avatar fallback="C" size="lg" variant="soft" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">默认</Badge>
                <Badge variant="primary">主要</Badge>
                <Badge variant="success">成功</Badge>
                <Badge variant="warning">警告</Badge>
                <Badge variant="error">错误</Badge>
                <Badge variant="soft">柔和</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* 消息演示 */}
        <div className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
              消息气泡
            </h3>
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  name={message.name}
                  timestamp={message.timestamp}
                  variant="glass"
                />
              ))}
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
              用户卡片
            </h3>
            <div className="space-y-3">
              <UserCard
                name="Alice"
                subtitle="活跃用户"
                badge="VIP"
                badgeVariant="primary"
                variant="glass"
              />
              <UserCard
                name="Bob"
                subtitle="新用户"
                badge="新人"
                badgeVariant="success"
                variant="glass"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* 主题说明 */}
      <Card variant="elevated" className="p-6">
        <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
          🎨 主题系统特性
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
              ✨ 设计特点
            </h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• 视觉友好的配色方案</li>
              <li>• 符合可访问性标准</li>
              <li>• 护眼的柔和色彩</li>
              <li>• 专业的设计语言</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
              🔧 功能特性
            </h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• 4种主题风格可选</li>
              <li>• 明暗模式切换</li>
              <li>• 本地存储用户偏好</li>
              <li>• 全局一致的体验</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
