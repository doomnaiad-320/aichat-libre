'use client'

import { Card, CardContent } from '@/components/admin/ui/card'
import type { LocalCharacter } from '@/lib/db/local'

type Props = {
  character: LocalCharacter
  onClick?: () => void
}

export function CharacterCard({ character, onClick }: Props) {
  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
            {character.avatar ? (
              <img src={character.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              character.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{character.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {character.description || '暂无描述'}
            </p>
          </div>
        </div>
        {character.tags && character.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {character.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
