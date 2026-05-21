import type { UIMessage } from 'ai'
import type { CanvasNode } from '@/components/interactive/canvas-node-graph/types'
import { getMessageText } from './utils'

type ChatNodePayload = {
  socratic_question?: unknown
  spawn_nodes?: unknown
}

function isCanvasNode(value: unknown): value is CanvasNode {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const node = value as Record<string, unknown>
  const shape = node.shape

  return (
    typeof node.id === 'string' &&
    typeof node.text === 'string' &&
    (shape === 'circle' || shape === 'square' || shape === 'flower' || shape === 'triangle') &&
    typeof node.x === 'number' &&
    typeof node.y === 'number' &&
    typeof node.size === 'number' &&
    typeof node.phase === 'number' &&
    typeof node.rotation === 'number'
  )
}

export function splitNodePayload(text: string) {
  const separatorIndex = text.lastIndexOf('|')

  if (separatorIndex === -1) {
    return { displayText: text, spawnNodes: [] as CanvasNode[] }
  }

  const displayText = text.slice(0, separatorIndex).trimEnd()
  const possibleJson = text.slice(separatorIndex + 1).trim()

  if (!possibleJson.startsWith('{')) {
    return { displayText: text, spawnNodes: [] as CanvasNode[] }
  }

  try {
    const payload = JSON.parse(possibleJson) as ChatNodePayload
    const spawnNodes = Array.isArray(payload.spawn_nodes) ? payload.spawn_nodes.filter(isCanvasNode) : []

    return { displayText, spawnNodes }
  } catch {
    return { displayText, spawnNodes: [] as CanvasNode[] }
  }
}

export function getDisplayMessageText(message: UIMessage) {
  const text = getMessageText(message)

  return message.role === 'assistant' ? splitNodePayload(text).displayText : text
}

export function getSpawnNodesFromMessage(message: UIMessage) {
  if (message.role !== 'assistant') {
    return []
  }

  return splitNodePayload(getMessageText(message)).spawnNodes
}
