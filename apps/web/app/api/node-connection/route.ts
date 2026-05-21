import { generateText } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'

export const runtime = 'nodejs'
export const maxDuration = 30

type ConnectionRequest = {
  from?: {
    id?: unknown
    text?: unknown
  }
  to?: {
    id?: unknown
    text?: unknown
  }
}

type ConnectionReview = {
  related: boolean
  title: string
  subtitle: string
  guidance: string
}

function getOllamaBaseURL() {
  const baseURL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api'
  const normalizedBaseURL = baseURL.replace(/\/$/, '')

  return normalizedBaseURL.endsWith('/api') ? normalizedBaseURL : `${normalizedBaseURL}/api`
}

const ollama = createOllama({
  baseURL: getOllamaBaseURL(),
  headers: process.env.OLLAMA_API_KEY ? { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` } : undefined,
})

function extractJson(text: string) {
  const trimmedText = text.trim()
  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const jsonText = fencedMatch?.[1] ?? trimmedText
  const firstBrace = jsonText.indexOf('{')
  const lastBrace = jsonText.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Connection review did not include JSON.')
  }

  return JSON.parse(jsonText.slice(firstBrace, lastBrace + 1)) as Partial<ConnectionReview>
}

function normalizeReview(review: Partial<ConnectionReview>, fromText: string, toText: string): ConnectionReview {
  const related = review.related === true

  return {
    related,
    title: typeof review.title === 'string' && review.title.trim() ? review.title : 'Strong connection!',
    subtitle:
      typeof review.subtitle === 'string' && review.subtitle.trim()
        ? review.subtitle
        : `${fromText} and ${toText} support the same idea.`,
    guidance:
      typeof review.guidance === 'string' && review.guidance.trim()
        ? review.guidance
        : `Try explaining how <hl>${fromText}</hl> changes, supports, or challenges <hl>${toText}</hl>.`,
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ConnectionRequest
    const fromText = typeof body.from?.text === 'string' ? body.from.text : ''
    const toText = typeof body.to?.text === 'string' ? body.to.text : ''

    if (!fromText || !toText) {
      return Response.json({ error: 'Missing connected node text.' }, { status: 400 })
    }

    const { text } = await generateText({
      model: ollama(process.env.OLLAMA_MODEL ?? 'llama3.2'),
      system: [
        'You evaluate whether two concept-map nodes are meaningfully related for a child learning history.',
        'Return only a valid JSON object. No Markdown, no prose outside JSON.',
        'Use this exact shape: { "related": boolean, "title": "string", "subtitle": "string", "guidance": "string" }.',
        'Set related true only when the connection is clearly meaningful and defensible.',
        'For related true, title should be celebratory and short. Subtitle should explain why the link works in one short sentence.',
        'For related false, guidance should be a brief assistant chat message that helps the child find a better connection.',
        'The guidance may use <hl>...</hl> around one important phrase. Do not wrap the whole message.',
      ].join(' '),
      prompt: `Evaluate this node connection:\nFrom: ${fromText}\nTo: ${toText}`,
    })
    const review = normalizeReview(extractJson(text), fromText, toText)

    return Response.json(review)
  } catch (error) {
    console.error('Node connection review failed:', error)
    return Response.json(
      {
        related: false,
        title: 'Connection needs work',
        subtitle: 'The relationship is not clear enough yet.',
        guidance: 'I am not sure that connection is strong yet. Try linking nodes where one idea <hl>explains, causes, or proves</hl> the other.',
      } satisfies ConnectionReview,
      { status: 200 }
    )
  }
}
