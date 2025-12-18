import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 获取AI服务商列表
export async function GET() {
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

    const providers = await prisma.aIProvider.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        models: true,
        enabled: true,
        inputPrice: true,
        outputPrice: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ providers })

  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: 'Failed to get providers' },
      { status: 500 }
    )
  }
}

// 创建AI服务商
export async function POST(request: NextRequest) {
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

    const { name, baseUrl, apiKey, models, enabled, inputPrice, outputPrice } = await request.json()

    if (!name || !apiKey) {
      return NextResponse.json(
        { error: 'Name and API key are required' },
        { status: 400 }
      )
    }

    const provider = await prisma.aIProvider.create({
      data: {
        name,
        baseUrl,
        apiKey,
        models: models || [],
        enabled: enabled ?? true,
        inputPrice,
        outputPrice
      },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        models: true,
        enabled: true,
        inputPrice: true,
        outputPrice: true
      }
    })

    return NextResponse.json({ provider })

  } catch (error) {
    console.error('Create provider error:', error)
    return NextResponse.json(
      { error: 'Failed to create provider' },
      { status: 500 }
    )
  }
}
