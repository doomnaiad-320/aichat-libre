'use client'

import { Card, CardContent } from '@/components/admin/ui/card'
import { Badge } from '@/components/admin/ui/badge'
import type { LocalPersona } from '@/lib/db/local'

type Props = {
  persona: LocalPersona
  onClick?: () => void
}

export function PersonaCard({ persona, onClick }: Props) {
  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
            {persona.avatar ? (
              <img src={persona.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              persona.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{persona.name}</h3>
              {persona.isDefault && (
                <Badge variant="secondary" className="text-xs">默认</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {persona.description || '暂无描述'}
            </p>
          </div>
        </div>
        {persona.personality && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
            {persona.personality}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
