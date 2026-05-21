import type { CanvasNode } from './types'

export const NODE_FILL = '#005f5d'
export const CONNECTION_STROKE = '#557b78'
export const USER_LINE_STROKE = '#0f766e'

export const NODE_APPEAR_MS = 680
export const NODE_STAGGER_MS = 105
export const EDGE_DASH_SPEED = 24
export const ARROW_SIZE = 14
export const ARROW_LINE_TRIM = 10

export const INITIAL_NODES: CanvasNode[] = [
  { id: 'node-1', text: 'Node 1', shape: 'flower', x: 0.7, y: 0.3, size: 160, phase: 0.2, rotation: -0.08 },
  { id: 'node-2', text: 'Node 2', shape: 'circle', x: 0.73, y: 0.6, size: 120, phase: 1.4, rotation: 0 },
  { id: 'node-3', text: 'Node 3', shape: 'circle', x: 0.75, y: 0.15, size: 114, phase: 2.3, rotation: 0 },
  { id: 'node-4', text: 'Node 4', shape: 'triangle', x: 0.85, y: 0.51, size: 126, phase: 3.2, rotation: -0.2 },
  { id: 'node-5', text: 'Node 5', shape: 'circle', x: 0.92, y: 0.4, size: 108, phase: 4.1, rotation: 0 },
  { id: 'node-6', text: 'Node 6', shape: 'square', x: 0.92, y: 0.12, size: 106, phase: 5, rotation: -0.08 },
  { id: 'node-7', text: 'Node 7', shape: 'circle', x: 0.88, y: 0.73, size: 118, phase: 5.7, rotation: 0 },
]

export const CONNECTIONS: Array<[string, string]> = [
  ['node-1', 'node-2'],
  ['node-1', 'node-4'],
  ['node-3', 'node-4'],
  ['node-3', 'node-5'],
  ['node-3', 'node-6'],
  ['node-4', 'node-7'],
]
