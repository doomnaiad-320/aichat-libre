import { streamText, type CoreMessage } from 'ai'
import { createProvider } from '@/lib/ai/providers'

export async function POST(req: Request) {
  const { messages, provider, model, apiKey, baseURL } = await req.json() as {
    messages: CoreMessage[]
    provider: string
    model: string
    apiKey: string
    baseURL?: string
  }

  const aiProvider = createProvider(provider, { apiKey, baseURL })

  const result = streamText({
    model: aiProvider(model),
    messages,
  })

  return result.toTextStreamResponse()
}
