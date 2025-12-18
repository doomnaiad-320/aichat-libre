'use client'

import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import {
  readCharacterFromPNG,
  readCharacterFromJSON,
  type CharacterCardV2
} from '@/lib/utils/character-card'

type Props = {
  onImport: (card: CharacterCardV2) => void
}

export function CharacterImport({ onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    let card: CharacterCardV2 | null = null

    if (file.name.endsWith('.png')) {
      card = await readCharacterFromPNG(file)
    } else if (file.name.endsWith('.json')) {
      card = await readCharacterFromJSON(file)
    }

    if (card) {
      onImport(card)
    } else {
      alert('无法解析角色卡文件')
    }

    // 重置input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.json"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-1" /> 导入
      </Button>
    </>
  )
}
