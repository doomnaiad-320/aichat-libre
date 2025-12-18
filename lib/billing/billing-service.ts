import { prisma } from '@/lib/db/prisma'
import { stripe, getPlan, type PlanId } from './stripe'

// 获取或创建Stripe客户
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true }
  })

  if (!user) throw new Error('User not found')

  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // 创建Stripe客户
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: { userId }
  })

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  })

  return customer.id
}

// 创建Checkout会话（订阅）
export async function createSubscriptionCheckout(
  userId: string,
  planId: PlanId,
  returnUrl: string
): Promise<string> {
  const plan = getPlan(planId)
  if (!plan.priceId) {
    throw new Error('Invalid plan')
  }

  const customerId = await getOrCreateStripeCustomer(userId)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: plan.priceId,
        quantity: 1
      }
    ],
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: {
      userId,
      planId
    }
  })

  return session.url || ''
}

// 创建Checkout会话（Token购买）
export async function createTokenPurchaseCheckout(
  userId: string,
  packageId: string,
  priceId: string,
  tokens: number,
  returnUrl: string
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: {
      userId,
      packageId,
      tokens: tokens.toString()
    }
  })

  return session.url || ''
}

// 获取用户余额
export async function getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  })
  return user?.balance ?? 0
}

// 获取用户计划
export async function getUserPlan(userId: string): Promise<{
  plan: PlanId
  expiresAt: Date | null
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true }
  })

  return {
    plan: (user?.plan?.toLowerCase() as PlanId) || 'free',
    expiresAt: user?.planExpiresAt || null
  }
}

// 消费Token
export async function spendTokens(
  userId: string,
  amount: number,
  model?: string,
  provider?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  // 检查余额
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  })

  if (!user) {
    return { success: false, newBalance: 0, error: 'User not found' }
  }

  if (user.balance < amount) {
    return { success: false, newBalance: user.balance, error: 'Insufficient balance' }
  }

  // 扣除余额并记录交易
  const newBalance = user.balance - amount

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: 'SPEND',
        amount: -amount,
        balance: newBalance,
        model,
        provider,
        description: `消费 ${amount} tokens`
      }
    })
  ])

  return { success: true, newBalance }
}

// 充值Token
export async function addTokens(
  userId: string,
  amount: number,
  type: 'PURCHASE' | 'SUBSCRIBE' | 'GRANT',
  stripePaymentId?: string,
  description?: string
): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  })

  if (!user) throw new Error('User not found')

  const newBalance = user.balance + amount

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    }),
    prisma.transaction.create({
      data: {
        userId,
        type,
        amount,
        balance: newBalance,
        stripePaymentId,
        description: description || `充值 ${amount} tokens`
      }
    })
  ])

  return newBalance
}

// 更新用户订阅
export async function updateUserSubscription(
  userId: string,
  planId: PlanId,
  stripeSubscriptionId: string,
  stripePriceId: string,
  expiresAt: Date
): Promise<void> {
  const planMap = {
    free: 'FREE',
    pro: 'PRO',
    premium: 'PREMIUM'
  } as const

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: planMap[planId],
      stripeSubscriptionId,
      stripePriceId,
      planExpiresAt: expiresAt
    }
  })
}

// 取消订阅
export async function cancelSubscription(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true }
  })

  if (user?.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(user.stripeSubscriptionId)
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: 'FREE',
      stripeSubscriptionId: null,
      stripePriceId: null,
      planExpiresAt: null
    }
  })
}

// 获取交易历史
export async function getTransactionHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  transactions: Array<{
    id: string
    type: string
    amount: number
    balance: number
    description: string | null
    createdAt: Date
  }>
  total: number
}> {
  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        amount: true,
        balance: true,
        description: true,
        createdAt: true
      }
    }),
    prisma.transaction.count({ where: { userId } })
  ])

  return { transactions, total }
}

// 获取用量统计
export async function getUsageStats(
  userId: string,
  days: number = 30
): Promise<{
  totalSpent: number
  dailyUsage: Array<{ date: string; tokens: number }>
}> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'SPEND',
      createdAt: { gte: startDate }
    },
    select: {
      amount: true,
      createdAt: true
    }
  })

  // 按日期分组
  const dailyMap = new Map<string, number>()
  let totalSpent = 0

  for (const tx of transactions) {
    const date = tx.createdAt.toISOString().split('T')[0]
    const spent = Math.abs(tx.amount)
    dailyMap.set(date, (dailyMap.get(date) || 0) + spent)
    totalSpent += spent
  }

  // 生成完整日期序列
  const dailyUsage: Array<{ date: string; tokens: number }> = []
  const current = new Date(startDate)
  const today = new Date()

  while (current <= today) {
    const date = current.toISOString().split('T')[0]
    dailyUsage.push({
      date,
      tokens: dailyMap.get(date) || 0
    })
    current.setDate(current.getDate() + 1)
  }

  return { totalSpent, dailyUsage }
}
