import { cn } from "@/lib/utils/cn"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900")}>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white dark:bg-gray-800">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold">Admin</span>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</a>
          <a href="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">用户管理</a>
          <a href="/admin/characters" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">角色卡审核</a>
          <a href="/admin/providers" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">AI服务商</a>
          <a href="/admin/billing" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">计费统计</a>
        </nav>
      </aside>
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
