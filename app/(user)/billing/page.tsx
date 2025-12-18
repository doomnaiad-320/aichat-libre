'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Coins, TrendingUp, Check } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Badge } from '@/components/admin/ui/badge'
import { SUBSCRIPTION_PLANS, TOKEN_PACKAGES, type PlanId } from '@/lib/billing/stripe'

type BillingInfo = {
  balance: number
  plan: PlanId
  planExpiresAt: string | null
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    balance: number
    description: string | null
    createdAt: string
  }>
  usage: Array<{ date: string; tokens: number }>
  totalSpent: number
}

export default function BillingPage() {
  const [info, setInfo] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    loadBillingInfo()
  }, [])

  const loadBillingInfo = async () => {
    try {
      const res = await fetch('/api/billing')
      if (res.ok) {
        const data = await res.json()
        setInfo(data)
      }
    } catch (error) {
      console.error('Failed to load billing info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: PlanId) => {
    setPurchasing(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription', planId })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to create checkout:', error)
    } finally {
      setPurchasing(null)
    }
  }

  const handleBuyTokens = async (packageId: string) => {
    setPurchasing(packageId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tokens', packageId })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to create checkout:', error)
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  const currentPlan = SUBSCRIPTION_PLANS[info?.plan || 'free']

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* 概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4" /> Token余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(info?.balance || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> 当前计划
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPlan.name}</div>
            {info?.planExpiresAt && (
              <p className="text-xs text-muted-foreground">
                到期: {new Date(info.planExpiresAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> 本月消费
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(info?.totalSpent || 0).toLocaleString()} tokens
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订阅计划 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">订阅计划</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => (
            <Card key={id} className={info?.plan === id ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {info?.plan === id && <Badge>当前</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/月</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {id !== 'free' && info?.plan !== id && (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(id as PlanId)}
                    disabled={purchasing !== null}
                  >
                    {purchasing === id ? '处理中...' : '升级'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Token充值 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Token充值</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOKEN_PACKAGES.map(pkg => (
            <Card key={pkg.id} className={'popular' in pkg && pkg.popular ? 'border-primary' : ''}>
              <CardContent className="pt-6 text-center space-y-2">
                {'popular' in pkg && pkg.popular && (
                  <Badge className="mb-2">热门</Badge>
                )}
                <div className="text-lg font-semibold">{pkg.name}</div>
                <div className="text-2xl font-bold">${pkg.price}</div>
                <Button
                  variant={'popular' in pkg && pkg.popular ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleBuyTokens(pkg.id)}
                  disabled={purchasing !== null}
                >
                  {purchasing === pkg.id ? '处理中...' : '购买'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 交易记录 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">最近交易</h2>
        <Card>
          <CardContent className="pt-6">
            {info?.recentTransactions?.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">暂无交易记录</p>
            ) : (
              <div className="space-y-2">
                {info?.recentTransactions?.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <div className="font-medium">{tx.description || tx.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
