'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import {
  exportCharacterAsJSON,
  exportCharacterAsPNG,
  type CharacterCardV2
} from '@/lib/utils/character-card'
import type { LocalCharacter } from '@/lib/db/local'

type Props = {
  character: LocalCharacter
}

function toCharacterCard(char: LocalCharacter): CharacterCardV2 {
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: char.name,
      description: char.description,
      personality: char.personality,
      scenario: char.scenario,
      first_mes: char.firstMessage,
      mes_example: char.exampleDialogue,
      tags: char.tags,
      creator: 'AIChatLibre',
      character_version: '1.0',
    }
  }
}

export function CharacterExport({ character }: Props) {
  const [exporting, setExporting] = useState(false)

  const handleExportJSON = () => {
    const card = toCharacterCard(character)
    const json = exportCharacterAsJSON(card)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, `${character.name}.json`)
  }

  const handleExportPNG = async () => {
    setExporting(true)
    try {
      const card = toCharacterCard(character)
      const blob = await exportCharacterAsPNG(card, character.avatar)
      downloadBlob(blob, `${character.name}.png`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex gap-1">
      <Button variant="outline" size="sm" onClick={handleExportJSON}>
        <Download className="h-3 w-3 mr-1" /> JSON
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exporting}>
        <Download className="h-3 w-3 mr-1" /> PNG
      </Button>
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
