import Link from 'next/link'
import { MessageCircle, Users, User, Book, CreditCard, Settings, Globe } from 'lucide-react'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-16 border-r flex flex-col items-center py-4 gap-4">
        <Link href="/chat" className="p-3 rounded-lg hover:bg-muted" title="聊天">
          <MessageCircle className="h-5 w-5" />
        </Link>
        <Link href="/characters" className="p-3 rounded-lg hover:bg-muted" title="角色">
          <Users className="h-5 w-5" />
        </Link>
        <Link href="/personas" className="p-3 rounded-lg hover:bg-muted" title="人设">
          <User className="h-5 w-5" />
        </Link>
        <Link href="/lorebooks" className="p-3 rounded-lg hover:bg-muted" title="世界书">
          <Book className="h-5 w-5" />
        </Link>
        <Link href="/community" className="p-3 rounded-lg hover:bg-muted" title="社区">
          <Globe className="h-5 w-5" />
        </Link>
        <Link href="/billing" className="p-3 rounded-lg hover:bg-muted" title="计费">
          <CreditCard className="h-5 w-5" />
        </Link>
        <Link href="/settings" className="p-3 rounded-lg hover:bg-muted mt-auto" title="设置">
          <Settings className="h-5 w-5" />
        </Link>
      </aside>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
