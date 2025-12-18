'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, Users, User, Book, CreditCard, Settings, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/chat', icon: MessageCircle, label: '聊天' },
  { href: '/characters', icon: Users, label: '角色' },
  { href: '/personas', icon: User, label: '人设' },
  { href: '/lorebooks', icon: Book, label: '世界书' },
  { href: '/community', icon: Globe, label: '社区' },
  { href: '/billing', icon: CreditCard, label: '计费' },
]

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-16 border-r flex-col items-center py-4 gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "p-3 rounded-lg hover:bg-muted transition-colors",
              pathname.startsWith(item.href) && "bg-muted"
            )}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </Link>
        ))}
        <Link
          href="/settings"
          className={cn(
            "p-3 rounded-lg hover:bg-muted mt-auto transition-colors",
            pathname === '/settings' && "bg-muted"
          )}
          title="设置"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <h1 className="font-semibold">AIChatLibre</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-muted"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-background border-b shadow-lg z-40 animate-in slide-in-from-top-2">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors",
                  pathname.startsWith(item.href) && "bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors",
                pathname === '/settings' && "bg-muted"
              )}
            >
              <Settings className="h-5 w-5" />
              <span>设置</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] transition-colors",
                pathname.startsWith(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Safe area spacer for mobile */}
      <div className="md:hidden h-16" />
    </div>
  )
}
