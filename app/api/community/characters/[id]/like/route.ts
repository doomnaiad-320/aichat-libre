import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 点赞/取消点赞角色卡
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: characterId } = await params

    // 检查角色卡是否存在
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, visibility: true, likes: true }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    if (character.visibility !== 'PUBLIC') {
      return NextResponse.json({ error: 'Cannot like private character' }, { status: 400 })
    }

    // 检查是否已点赞
    const existingLike = await prisma.characterLike.findUnique({
      where: {
        userId_characterId: {
          userId: session.user.id,
          characterId
        }
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        prisma.characterLike.delete({
          where: {
            userId_characterId: {
              userId: session.user.id,
              characterId
            }
          }
        }),
        prisma.character.update({
          where: { id: characterId },
          data: { likes: { decrement: 1 } }
        })
      ])

      return NextResponse.json({
        liked: false,
        likes: character.likes - 1
      })
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.characterLike.create({
          data: {
            userId: session.user.id,
            characterId
          }
        }),
        prisma.character.update({
          where: { id: characterId },
          data: { likes: { increment: 1 } }
        })
      ])

      return NextResponse.json({
        liked: true,
        likes: character.likes + 1
      })
    }

  } catch (error) {
    console.error('Like character error:', error)
    return NextResponse.json(
      { error: 'Failed to like character' },
      { status: 500 }
    )
  }
}
