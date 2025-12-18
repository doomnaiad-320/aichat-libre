import Stripe from 'stripe'

// 服务端Stripe实例 - 仅在有API密钥时初始化
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null as unknown as Stripe // 占位符，实际使用时会检查

// 订阅计划配置
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: '免费版',
    description: '基础功能体验',
    price: 0,
    priceId: null, // 免费计划不需要Stripe价格ID
    features: [
      '每日100条消息',
      '基础角色卡',
      '本地存储',
    ],
    limits: {
      dailyMessages: 100,
      maxCharacters: 5,
      maxPersonas: 1,
      maxLorebooks: 1,
    }
  },
  pro: {
    id: 'pro',
    name: '专业版',
    description: '更多功能和配额',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      '每日1000条消息',
      '无限角色卡',
      '无限人设',
      '高级记忆系统',
      '优先支持',
    ],
    limits: {
      dailyMessages: 1000,
      maxCharacters: -1, // -1表示无限
      maxPersonas: -1,
      maxLorebooks: -1,
    }
  },
  premium: {
    id: 'premium',
    name: '高级版',
    description: '全部功能解锁',
    price: 19.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    features: [
      '无限消息',
      '全部功能',
      '专属客服',
      'API访问',
      '优先新功能',
    ],
    limits: {
      dailyMessages: -1,
      maxCharacters: -1,
      maxPersonas: -1,
      maxLorebooks: -1,
    }
  }
} as const

export type PlanId = keyof typeof SUBSCRIPTION_PLANS
export type Plan = typeof SUBSCRIPTION_PLANS[PlanId]

// Token套餐配置
export const TOKEN_PACKAGES = [
  {
    id: 'tokens_10k',
    name: '10,000 Tokens',
    tokens: 10000,
    price: 1.99,
    priceId: process.env.STRIPE_TOKENS_10K_PRICE_ID || '',
  },
  {
    id: 'tokens_50k',
    name: '50,000 Tokens',
    tokens: 50000,
    price: 7.99,
    priceId: process.env.STRIPE_TOKENS_50K_PRICE_ID || '',
    popular: true,
  },
  {
    id: 'tokens_200k',
    name: '200,000 Tokens',
    tokens: 200000,
    price: 24.99,
    priceId: process.env.STRIPE_TOKENS_200K_PRICE_ID || '',
  },
  {
    id: 'tokens_1m',
    name: '1,000,000 Tokens',
    tokens: 1000000,
    price: 99.99,
    priceId: process.env.STRIPE_TOKENS_1M_PRICE_ID || '',
  },
] as const

export type TokenPackage = typeof TOKEN_PACKAGES[number]

// 获取计划详情
export function getPlan(planId: PlanId): Plan {
  return SUBSCRIPTION_PLANS[planId]
}

// 获取Token套餐
export function getTokenPackage(packageId: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find(p => p.id === packageId)
}
