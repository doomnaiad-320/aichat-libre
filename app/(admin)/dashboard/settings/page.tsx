'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'AIChatLibre',
    siteDescription: 'AI角色扮演聊天平台',
    allowRegistration: true,
    defaultTokens: 1000,
    maxFreeMessages: 100,
    announcement: ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert('设置已保存（演示）')
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基础设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">站点名称</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">站点描述</label>
              <Input
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowRegistration"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="allowRegistration" className="text-sm">允许新用户注册</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">配额设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">新用户初始Token</label>
              <Input
                type="number"
                value={settings.defaultTokens}
                onChange={(e) => setSettings({ ...settings, defaultTokens: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">新注册用户获得的初始Token数量</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">免费用户每日消息数</label>
              <Input
                type="number"
                value={settings.maxFreeMessages}
                onChange={(e) => setSettings({ ...settings, maxFreeMessages: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">免费计划用户每日可发送的消息数量</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">公告设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">全站公告</label>
              <textarea
                value={settings.announcement}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                className="w-full h-24 px-3 py-2 text-sm border rounded-md resize-none"
                placeholder="输入公告内容，留空则不显示公告..."
              />
              <p className="text-xs text-muted-foreground">公告将显示在用户端首页顶部</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
