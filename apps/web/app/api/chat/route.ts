import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'

export const runtime = 'nodejs'
export const maxDuration = 60

function getOllamaBaseURL() {
  const baseURL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api'
  const normalizedBaseURL = baseURL.replace(/\/$/, '')

  return normalizedBaseURL.endsWith('/api') ? normalizedBaseURL : `${normalizedBaseURL}/api`
}

const ollama = createOllama({
  baseURL: getOllamaBaseURL(),
  headers: process.env.OLLAMA_API_KEY ? { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` } : undefined,
})

function getChatErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return 'Failed to generate a chat response.'
  }

  const providerError = error as {
    responseBody?: string
    statusCode?: number
    message?: string
  }

  if (providerError.responseBody) {
    try {
      const body = JSON.parse(providerError.responseBody) as { error?: string }

      if (body.error) {
        return body.error
      }
    } catch {
      return providerError.responseBody.trim()
    }
  }

  if (providerError.statusCode === 403) {
    return 'Ollama rejected this request. Check that your API key has access to the selected model.'
  }

  return providerError.message ?? 'Failed to generate a chat response.'
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages?: UIMessage[] } = await req.json()

    if (!Array.isArray(messages)) {
      return Response.json({ error: 'Missing chat messages.' }, { status: 400 })
    }

    const result = streamText({
      model: ollama(process.env.OLLAMA_MODEL ?? 'llama3.2'),
      system:
        'You are JurneeGo, a friendly learning companion. Keep answers clear, curious, and age-appropriate. Ask short follow-up questions when helpful. The response is pure text, no .md format, no icons',
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse({
      onError(error) {
        console.error('Chat stream failed:', error)
        return getChatErrorMessage(error)
      },
    })
  } catch (error) {
    console.error('Chat request failed:', error)
    return Response.json({ error: getChatErrorMessage(error) }, { status: 500 })
  }
}
