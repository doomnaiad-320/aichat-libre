// 全局导航栏

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button, Avatar } from '@/components/ui/atoms'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { useTheme } from '@/components/ui/theme-provider'

export function Navbar() {
  const pathname = usePathname()
  const { themeVariant } = useTheme()
  const [showThemePanel, setShowThemePanel] = useState(false)

  // 根据当前路径确定导航项
  const navItems = [
    { href: '/chat', label: '💬 聊天', active: pathname.startsWith('/chat') },
    { href: '/characters', label: '🎭 角色卡', active: pathname.startsWith('/characters') },
    { href: '/community', label: '🌍 社区', active: pathname.startsWith('/community') },
    { href: '/settings', label: '⚙️ 设置', active: pathname.startsWith('/settings') },
  ]

  const getThemeColor = () => {
    switch (themeVariant) {
      case 'aiChat': return 'border-blue-200 dark:border-blue-800'
      case 'character': return 'border-purple-200 dark:border-purple-800'
      case 'community': return 'border-emerald-200 dark:border-emerald-800'
      case 'minimal': return 'border-slate-200 dark:border-slate-800'
      default: return 'border-slate-200 dark:border-slate-800'
    }
  }

  return (
    <>
      <nav className={`sticky top-0 z-40 border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm ${getThemeColor()}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                AIChatLibre
              </span>
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? 'soft' : 'ghost'}
                    size="sm"
                    className="text-sm"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center gap-2">
              {/* 主题切换 */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowThemePanel(!showThemePanel)}
                  title="主题设置"
                >
                  🎨
                </Button>
                
                {showThemePanel && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowThemePanel(false)}
                    />
                    <div className="absolute right-0 top-12 z-50">
                      <ThemeSwitcher />
                    </div>
                  </>
                )}
              </div>

              {/* 用户头像 */}
              <Avatar
                src="/avatars/user.png"
                fallback="U"
                size="sm"
                variant="ring"
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant={item.active ? 'soft' : 'ghost'}
                  size="sm"
                  className="w-full text-xs"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
