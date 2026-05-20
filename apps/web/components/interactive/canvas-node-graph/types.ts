export type ShapeKind = 'flower' | 'circle' | 'square' | 'triangle'

export type CanvasNode = {
  id: string
  text: string
  shape: ShapeKind
  x: number
  y: number
  size: number
  phase: number
  rotation: number
}

export type RenderedNode = CanvasNode & {
  scale: number
  visible: boolean
}

export type Point = {
  x: number
  y: number
}

export type ConnectedLinePoint = {
  progress: number
  offsetRatio: number
}

export type DrawnLine = {
  points: Point[]
  startNodeId?: string
  endNodeId?: string
  connectedShape?: ConnectedLinePoint[]
}

export type DragState = {
  nodeId: string
  offset: Point
}
