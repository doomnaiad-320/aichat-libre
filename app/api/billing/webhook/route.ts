import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, type PlanId } from '@/lib/billing/stripe'
import { addTokens, updateUserSubscription } from '@/lib/billing/billing-service'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  if (session.mode === 'payment') {
    // Token购买
    const tokens = parseInt(session.metadata?.tokens || '0')
    if (tokens > 0) {
      await addTokens(
        userId,
        tokens,
        'PURCHASE',
        session.payment_intent as string,
        `购买 ${tokens} tokens`
      )
    }
  }
  // 订阅在subscription.created中处理
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  if (customer.deleted) return

  const userId = (customer as Stripe.Customer).metadata?.userId
  if (!userId) return

  const priceId = subscription.items.data[0]?.price.id
  const planId = getPlanIdFromPriceId(priceId)

  // Get subscription end date from subscription object
  const currentPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end

  await updateUserSubscription(
    userId,
    planId,
    subscription.id,
    priceId,
    new Date(currentPeriodEnd * 1000)
  )
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  if (customer.deleted) return

  const userId = (customer as Stripe.Customer).metadata?.userId
  if (!userId) return

  await updateUserSubscription(
    userId,
    'free',
    '',
    '',
    new Date()
  )
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // 订阅续费时赠送Token
  const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    if (customer.deleted) return

    const userId = (customer as Stripe.Customer).metadata?.userId
    if (!userId) return

    const planId = getPlanIdFromPriceId(subscription.items.data[0]?.price.id)
    const bonusTokens = getSubscriptionBonusTokens(planId)

    const paymentIntent = (invoice as unknown as { payment_intent: string | null }).payment_intent

    if (bonusTokens > 0) {
      await addTokens(
        userId,
        bonusTokens,
        'SUBSCRIBE',
        paymentIntent || undefined,
        `${planId} 订阅赠送 ${bonusTokens} tokens`
      )
    }
  }
}

function getPlanIdFromPriceId(priceId: string): PlanId {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'premium'
  return 'free'
}

function getSubscriptionBonusTokens(planId: PlanId): number {
  const bonusMap: Record<PlanId, number> = {
    free: 0,
    pro: 50000,
    premium: 200000
  }
  return bonusMap[planId]
}
