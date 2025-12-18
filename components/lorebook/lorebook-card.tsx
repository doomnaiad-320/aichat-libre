'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Badge } from '@/components/admin/ui/badge'
import type { LocalLorebook } from '@/lib/db/local'
import { Book } from 'lucide-react'

type Props = {
  lorebook: LocalLorebook
  onClick?: () => void
}

export function LorebookCard({ lorebook, onClick }: Props) {
  const enabledCount = lorebook.entries.filter(e => e.enabled).length
  const totalCount = lorebook.entries.length

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Book className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base truncate">{lorebook.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {enabledCount}/{totalCount} 条目启用
          </span>
          {lorebook.characterId ? (
            <Badge variant="secondary">角色专属</Badge>
          ) : (
            <Badge variant="outline">全局</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
