import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 下载角色卡
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: characterId } = await params

    // 获取角色卡
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        description: true,
        cardData: true,
        visibility: true,
        userId: true,
        downloads: true
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 检查访问权限
    if (character.visibility !== 'PUBLIC') {
      const session = await auth()
      if (character.userId !== session?.user?.id) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 })
      }
    }

    // 增加下载计数（只对公开角色卡）
    if (character.visibility === 'PUBLIC') {
      await prisma.character.update({
        where: { id: characterId },
        data: { downloads: { increment: 1 } }
      })
    }

    // 返回角色卡数据
    return NextResponse.json({
      character: {
        id: character.id,
        name: character.name,
        description: character.description,
        cardData: character.cardData
      },
      downloads: character.downloads + 1
    })

  } catch (error) {
    console.error('Download character error:', error)
    return NextResponse.json(
      { error: 'Failed to download character' },
      { status: 500 }
    )
  }
}
