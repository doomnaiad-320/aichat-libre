import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getUserBalance,
  getUserPlan,
  getTransactionHistory,
  getUsageStats
} from '@/lib/billing/billing-service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [balance, plan, transactions, usage] = await Promise.all([
      getUserBalance(session.user.id),
      getUserPlan(session.user.id),
      getTransactionHistory(session.user.id, 20),
      getUsageStats(session.user.id, 30)
    ])

    return NextResponse.json({
      balance,
      plan: plan.plan,
      planExpiresAt: plan.expiresAt,
      recentTransactions: transactions.transactions,
      usage: usage.dailyUsage,
      totalSpent: usage.totalSpent
    })

  } catch (error) {
    console.error('Get billing info error:', error)
    return NextResponse.json(
      { error: 'Failed to get billing info' },
      { status: 500 }
    )
  }
}
