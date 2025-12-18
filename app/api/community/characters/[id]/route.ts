import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 获取角色卡详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 检查是否是私有角色卡
    if (character.visibility !== 'PUBLIC') {
      const session = await auth()
      if (character.userId !== session?.user?.id) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 })
      }
    }

    // 检查当前用户是否已点赞
    let isLiked = false
    const session = await auth()
    if (session?.user?.id) {
      const like = await prisma.characterLike.findUnique({
        where: {
          userId_characterId: {
            userId: session.user.id,
            characterId: id
          }
        }
      })
      isLiked = !!like
    }

    return NextResponse.json({
      character: {
        ...character,
        isLiked
      }
    })

  } catch (error) {
    console.error('Get character detail error:', error)
    return NextResponse.json(
      { error: 'Failed to get character' },
      { status: 500 }
    )
  }
}

// 更新角色卡
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, description, tags, cardData, visibility } = await request.json()

    // 检查所有权
    const existing = await prisma.character.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const character = await prisma.character.update({
      where: { id },
      data: {
        name,
        description,
        tags,
        cardData,
        visibility
      }
    })

    return NextResponse.json({ character })

  } catch (error) {
    console.error('Update character error:', error)
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    )
  }
}

// 删除角色卡
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // 检查所有权
    const existing = await prisma.character.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.character.delete({ where: { id } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    )
  }
}
