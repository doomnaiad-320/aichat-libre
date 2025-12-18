import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import type { PlanType, UserRole } from '@prisma/client'

// 获取用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        balance: true,
        stripeCustomerId: true,
        createdAt: true,
        updatedAt: true,
        characters: {
          select: {
            id: true,
            name: true,
            visibility: true,
            likes: true,
            downloads: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            balance: true,
            description: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: {
            characters: true,
            transactions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user detail error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const { role, plan, balance, addBalance } = await request.json()

    const updateData: Record<string, unknown> = {}

    if (role) {
      updateData.role = role as UserRole
    }

    if (plan) {
      updateData.plan = plan as PlanType
    }

    if (typeof balance === 'number') {
      updateData.balance = balance
    }

    // 调整余额（增减）
    if (typeof addBalance === 'number' && addBalance !== 0) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { balance: true }
      })

      if (user) {
        const newBalance = user.balance + addBalance

        await prisma.$transaction([
          prisma.user.update({
            where: { id },
            data: { balance: newBalance }
          }),
          prisma.transaction.create({
            data: {
              userId: id,
              type: addBalance > 0 ? 'GRANT' : 'SPEND',
              amount: addBalance,
              balance: newBalance,
              description: `管理员调整: ${addBalance > 0 ? '+' : ''}${addBalance} tokens`
            }
          })
        ])

        return NextResponse.json({
          success: true,
          balance: newBalance
        })
      }
    }

    if (Object.keys(updateData).length > 0) {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plan: true,
          balance: true
        }
      })

      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: 'No data to update' }, { status: 400 })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // 不能删除自己
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
