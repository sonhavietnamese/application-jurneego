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

const systemPrompt = [
  "You are the JurneeGo Inquiry Engine, an AI guiding a child's critical thinking canvas.",
  'Your job is to conversationalize with the child, then output an updated node schema to build their thought map.',
  'Keep text responses brief, clear, and focused on pushing the child toward evidence and reflection.',
  'At the very end of your response, you MUST append a pipe separator (|) followed by a valid JSON object.',
  'The JSON object MUST follow this exact shape: { "socratic_question": "string", "spawn_nodes": Array<CanvasNode> }.',
  'Each object in the "spawn_nodes" array MUST strictly follow this type definition:',
  '{ "id": "string (unique)", "text": "string (core concept name)", "shape": "circle" | "square" | "flower", "x": number (float between 0.0 and 1.0), "y": number (float between 0.0 and 1.0), "size": number (usually 120 to 140), "phase": number (sequential index float, e.g., 6.1), "rotation": number (small float float, e.g., -0.05 to 0.05) }.',
  'Ensure new spawn nodes have coordinate positions (x, y) that place them lower than the main core question node or spread out dynamically.',
  'Example format: Great thought! What caused this shift? | { "socratic_question": "What caused this shift?", "spawn_nodes": [{ "id": "node-7", "text": "Naval Rivalry", "shape": "circle", "x": 0.75, "y": 0.45, "size": 130, "phase": 6.0, "rotation": 0.02 }] }',
].join(' ')

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
      system: systemPrompt,
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
