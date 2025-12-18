import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createSubscriptionCheckout,
  createTokenPurchaseCheckout
} from '@/lib/billing/billing-service'
import { TOKEN_PACKAGES, type PlanId } from '@/lib/billing/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, planId, packageId } = await request.json()
    const origin = request.headers.get('origin') || ''
    const returnUrl = `${origin}/billing`

    if (type === 'subscription') {
      // 订阅
      if (!planId || !['pro', 'premium'].includes(planId)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      const checkoutUrl = await createSubscriptionCheckout(
        session.user.id,
        planId as PlanId,
        returnUrl
      )

      return NextResponse.json({ url: checkoutUrl })

    } else if (type === 'tokens') {
      // Token购买
      const pkg = TOKEN_PACKAGES.find(p => p.id === packageId)
      if (!pkg) {
        return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
      }

      const checkoutUrl = await createTokenPurchaseCheckout(
        session.user.id,
        pkg.id,
        pkg.priceId,
        pkg.tokens,
        returnUrl
      )

      return NextResponse.json({ url: checkoutUrl })

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
