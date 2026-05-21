import { create } from 'zustand'
import type { CanvasNode } from '@/components/interactive/canvas-node-graph/types'
import { clamp } from '@/components/interactive/canvas-node-graph/geometry'

const INITIAL_NODES: CanvasNode[] = [
  { id: 'node-1', text: 'The Punic Struggle', shape: 'flower', x: 0.7, y: 0.3, size: 160, phase: 0.2, rotation: -0.08 },
  { id: 'node-2', text: 'Trade Networks', shape: 'circle', x: 0.7, y: 0.7, size: 120, phase: 1.4, rotation: 0 },
  {
    id: 'node-3',
    text: 'Territorial Expansion',
    shape: 'circle',
    x: 0.8,
    y: 0.1,
    size: 130,
    phase: 2.3,
    rotation: 0,
  },
  {
    id: 'node-4',
    text: 'Sicily (The Spark)',
    shape: 'square',
    x: 0.85,
    y: 0.55,
    size: 130,
    phase: 3.2,
    rotation: -0.2,
  },
  { id: 'node-5', text: 'Resource Scarcity', shape: 'circle', x: 0.92, y: 0.4, size: 130, phase: 4.1, rotation: 0 },
  {
    id: 'node-6',
    text: 'Diplomatic Alliances',
    shape: 'square',
    x: 0.92,
    y: 0.12,
    size: 120,
    phase: 5,
    rotation: -0.08,
  },
]

type NodeGraphState = {
  nodes: CanvasNode[]
  addNodes: (nodes: CanvasNode[]) => void
}

function getNormalizedRadius(node: CanvasNode) {
  return Math.max(0.07, node.size / 1400)
}

function overlapsExistingNode(candidate: CanvasNode, existingNodes: CanvasNode[]) {
  return existingNodes.some((node) => {
    const distance = Math.hypot((candidate.x - node.x) * 1.35, candidate.y - node.y)
    const minDistance = getNormalizedRadius(candidate) + getNormalizedRadius(node) + 0.04

    return distance < minDistance
  })
}

function getAngleFromAnchor(node: CanvasNode, anchorNode: CanvasNode) {
  const angle = Math.atan2(node.y - anchorNode.y, node.x - anchorNode.x)

  return Number.isFinite(angle) ? angle : Math.PI / 2
}

function getCandidatePositionsAroundAnchor(node: CanvasNode, existingNodes: CanvasNode[]) {
  const anchorNode = existingNodes.find((existingNode) => existingNode.id === 'node-1') ?? existingNodes[0]
  const suggestedPosition = {
    x: clamp(node.x, 0.1, 0.8),
    y: clamp(node.y, 0.1, 0.8),
  }

  if (!anchorNode) {
    return [suggestedPosition]
  }

  const anchorPosition = {
    x: clamp(anchorNode.x, 0.1, 0.8),
    y: clamp(anchorNode.y, 0.1, 0.8),
  }
  const preferredAngle = getAngleFromAnchor(node, anchorNode)
  const angleOffsets = [
    0,
    Math.PI / 5,
    -Math.PI / 5,
    (Math.PI * 2) / 5,
    (-Math.PI * 2) / 5,
    Math.PI,
    (Math.PI * 3) / 5,
    (-Math.PI * 3) / 5,
  ]
  const positions = [suggestedPosition]

  for (let radius = 0.18; radius <= 0.5; radius += 0.09) {
    angleOffsets.forEach((angleOffset) => {
      const angle = preferredAngle + angleOffset

      positions.push({
        x: clamp(anchorPosition.x + Math.cos(angle) * radius, 0.1, 0.92),
        y: clamp(anchorPosition.y + Math.sin(angle) * radius, 0.1, 0.9),
      })
    })
  }

  for (let radius = 0.26; radius <= 0.78; radius += 0.13) {
    for (let step = 0; step < 16; step += 1) {
      const angle = step * (Math.PI / 8)

      positions.push({
        x: clamp(anchorPosition.x + Math.cos(angle) * radius, 0.1, 0.92),
        y: clamp(anchorPosition.y + Math.sin(angle) * radius, 0.1, 0.9),
      })
    }
  }

  return positions
}

function placeWithoutOverlap(node: CanvasNode, existingNodes: CanvasNode[]) {
  const candidates = getCandidatePositionsAroundAnchor(node, existingNodes)
  const position = candidates.find((candidate) => !overlapsExistingNode({ ...node, ...candidate }, existingNodes))

  return {
    ...node,
    x: position?.x ?? clamp(node.x, 0.1, 0.92),
    y: position?.y ?? clamp(node.y, 0.1, 0.9),
  }
}

function getUniqueNodeId(id: string, existingNodes: CanvasNode[]) {
  const existingIds = new Set(existingNodes.map((node) => node.id))

  if (!existingIds.has(id)) {
    return id
  }

  let suffix = 1
  let nextId = `${id}-${suffix}`

  while (existingIds.has(nextId)) {
    suffix += 1
    nextId = `${id}-${suffix}`
  }

  return nextId
}

export const useNodeGraphStore = create<NodeGraphState>((set) => ({
  nodes: INITIAL_NODES,
  addNodes: (incomingNodes) => {
    set((state) => {
      const nextNodes = [...state.nodes]
      const existingTexts = new Set(nextNodes.map((node) => node.text.trim().toLowerCase()))

      incomingNodes.forEach((incomingNode) => {
        const textKey = incomingNode.text.trim().toLowerCase()

        if (!textKey || existingTexts.has(textKey)) {
          return
        }

        const uniqueNode = {
          ...incomingNode,
          id: getUniqueNodeId(incomingNode.id, nextNodes),
          size: clamp(incomingNode.size, 110, 170),
          x: clamp(incomingNode.x, 0.1, 0.92),
          y: clamp(incomingNode.y, 0.1, 0.9),
          rotation: clamp(incomingNode.rotation, -0.35, 0.35),
        }
        const placedNode = placeWithoutOverlap(uniqueNode, nextNodes)

        nextNodes.push(placedNode)
        existingTexts.add(textKey)
      })

      return { nodes: nextNodes }
    })
  },
}))
