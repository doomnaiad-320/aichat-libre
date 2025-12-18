import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'

// 获取服务商详情
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

    const provider = await prisma.aIProvider.findUnique({
      where: { id }
    })

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // 隐藏API Key的中间部分
    const maskedApiKey = provider.apiKey.length > 8
      ? `${provider.apiKey.slice(0, 4)}****${provider.apiKey.slice(-4)}`
      : '****'

    return NextResponse.json({
      provider: {
        ...provider,
        apiKey: maskedApiKey
      }
    })

  } catch (error) {
    console.error('Get provider detail error:', error)
    return NextResponse.json(
      { error: 'Failed to get provider' },
      { status: 500 }
    )
  }
}

// 更新服务商
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
    const { name, baseUrl, apiKey, models, enabled, inputPrice, outputPrice } = await request.json()

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (baseUrl !== undefined) updateData.baseUrl = baseUrl
    if (apiKey !== undefined && !apiKey.includes('****')) {
      // 只有当apiKey不是masked的时候才更新
      updateData.apiKey = apiKey
    }
    if (models !== undefined) updateData.models = models
    if (enabled !== undefined) updateData.enabled = enabled
    if (inputPrice !== undefined) updateData.inputPrice = inputPrice
    if (outputPrice !== undefined) updateData.outputPrice = outputPrice

    const provider = await prisma.aIProvider.update({
      where: { id },
      data: updateData,
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
    console.error('Update provider error:', error)
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    )
  }
}

// 删除服务商
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

    await prisma.aIProvider.delete({ where: { id } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete provider error:', error)
    return NextResponse.json(
      { error: 'Failed to delete provider' },
      { status: 500 }
    )
  }
}
