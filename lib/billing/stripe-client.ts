import { loadStripe } from '@stripe/stripe-js'

// 获取Stripe客户端实例
export async function getStripe() {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
}

// 重定向到Checkout - 使用URL而不是客户端SDK
export async function redirectToCheckout(checkoutUrl: string): Promise<void> {
  window.location.href = checkoutUrl
}
