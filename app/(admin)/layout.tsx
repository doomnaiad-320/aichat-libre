'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils/cn"
import {
  LayoutDashboard,
  Users,
  FileText,
  Server,
  CreditCard,
  Settings,
  ChevronLeft
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/users', icon: Users, label: '用户管理' },
  { href: '/dashboard/characters', icon: FileText, label: '角色卡审核' },
  { href: '/dashboard/providers', icon: Server, label: 'AI服务商' },
  { href: '/dashboard/billing', icon: CreditCard, label: '计费统计' },
  { href: '/dashboard/settings', icon: Settings, label: '系统设置' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900")}>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white dark:bg-gray-800">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-xl font-bold">管理后台</span>
          <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="返回用户端">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
