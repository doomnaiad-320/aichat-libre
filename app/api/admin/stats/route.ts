import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 获取管理后台统计数据
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查是否是管理员
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 并行查询统计数据
    const [
      totalUsers,
      todayUsers,
      totalCharacters,
      publicCharacters,
      todayTransactions,
      monthTransactions,
      recentUsers,
      dailyStats
    ] = await Promise.all([
      // 总用户数
      prisma.user.count(),
      // 今日注册用户
      prisma.user.count({
        where: { createdAt: { gte: todayStart } }
      }),
      // 总角色卡数
      prisma.character.count(),
      // 公开角色卡数
      prisma.character.count({
        where: { visibility: 'PUBLIC' }
      }),
      // 今日交易
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: todayStart },
          type: { in: ['PURCHASE', 'SUBSCRIBE'] }
        },
        _sum: { amount: true },
        _count: true
      }),
      // 本月交易
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: monthStart },
          type: { in: ['PURCHASE', 'SUBSCRIBE'] }
        },
        _sum: { amount: true },
        _count: true
      }),
      // 最近注册用户
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          plan: true,
          createdAt: true
        }
      }),
      // 过去7天每日统计
      getDailyStats()
    ])

    return NextResponse.json({
      overview: {
        totalUsers,
        todayUsers,
        totalCharacters,
        publicCharacters,
        todayRevenue: todayTransactions._sum.amount || 0,
        todayTransactionCount: todayTransactions._count,
        monthRevenue: monthTransactions._sum.amount || 0,
        monthTransactionCount: monthTransactions._count
      },
      recentUsers,
      dailyStats
    })

  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}

// 获取每日统计数据
async function getDailyStats() {
  const stats = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    const [users, transactions] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      }),
      prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: dayStart,
            lt: dayEnd
          },
          type: { in: ['PURCHASE', 'SUBSCRIBE'] }
        },
        _sum: { amount: true }
      })
    ])

    stats.push({
      date: dayStart.toISOString().split('T')[0],
      users,
      revenue: transactions._sum.amount || 0
    })
  }

  return stats
}
