import Link from 'next/link'
import { MessageCircle, Users } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'

export default function UserHome() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <MessageCircle size={64} className="text-primary" />
      <h1 className="text-3xl font-bold">AI Chat Libre</h1>
      <p className="text-muted-foreground">AI角色扮演聊天平台</p>
      <div className="flex gap-4 mt-4">
        <Link href="/chat">
          <Button size="lg">
            <MessageCircle className="h-4 w-4 mr-2" />
            开始聊天
          </Button>
        </Link>
        <Link href="/characters">
          <Button variant="outline" size="lg">
            <Users className="h-4 w-4 mr-2" />
            浏览角色
          </Button>
        </Link>
      </div>
    </div>
  )
}
