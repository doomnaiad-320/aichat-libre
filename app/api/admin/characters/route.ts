import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 获取角色卡列表（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const visibility = searchParams.get('visibility')
    const sort = searchParams.get('sort') || 'latest'

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    if (visibility) {
      where.visibility = visibility
    }

    // 排序
    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sort === 'likes') {
      orderBy = { likes: 'desc' }
    } else if (sort === 'downloads') {
      orderBy = { downloads: 'desc' }
    }

    const [characters, total] = await prisma.$transaction([
      prisma.character.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          tags: true,
          visibility: true,
          likes: true,
          downloads: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
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
    console.error('Get characters error:', error)
    return NextResponse.json(
      { error: 'Failed to get characters' },
      { status: 500 }
    )
  }
}
