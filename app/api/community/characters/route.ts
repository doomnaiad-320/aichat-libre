import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 获取社区角色卡列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'latest' // latest, popular, downloads
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: Record<string, unknown> = {
      visibility: 'PUBLIC'
    }

    if (tag) {
      where.tags = { array_contains: tag }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // 排序
    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sort === 'popular') {
      orderBy = { likes: 'desc' }
    } else if (sort === 'downloads') {
      orderBy = { downloads: 'desc' }
    }

    const [characters, total] = await prisma.$transaction([
      prisma.character.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          tags: true,
          likes: true,
          downloads: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }),
      prisma.character.count({ where })
    ])

    return NextResponse.json({
      characters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get community characters error:', error)
    return NextResponse.json(
      { error: 'Failed to get characters' },
      { status: 500 }
    )
  }
}

// 发布角色卡到社区
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, tags, cardData, visibility } = await request.json()

    if (!name || !cardData) {
      return NextResponse.json(
        { error: 'Name and cardData are required' },
        { status: 400 }
      )
    }

    const character = await prisma.character.create({
      data: {
        userId: session.user.id,
        name,
        description,
        tags: tags || [],
        cardData,
        visibility: visibility || 'PUBLIC'
      }
    })

    return NextResponse.json({ character })

  } catch (error) {
    console.error('Publish character error:', error)
    return NextResponse.json(
      { error: 'Failed to publish character' },
      { status: 500 }
    )
  }
}
