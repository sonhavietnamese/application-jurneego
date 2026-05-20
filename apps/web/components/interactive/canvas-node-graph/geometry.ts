import { ARROW_LINE_TRIM } from './constants'
import type { ConnectedLinePoint, Point, RenderedNode } from './types'

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function easeOutBack(value: number) {
  const c1 = 1.70158
  const c3 = c1 + 1

  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2)
}

export function getNodeRadius(node: RenderedNode) {
  return node.size * node.scale * 0.55
}

export function getPointOnNodeEdge(node: RenderedNode, toward: Point) {
  const distance = Math.hypot(toward.x - node.x, toward.y - node.y)

  if (distance === 0) {
    return { x: node.x, y: node.y }
  }

  const radius = getNodeRadius(node)

  return {
    x: node.x + ((toward.x - node.x) / distance) * radius,
    y: node.y + ((toward.y - node.y) / distance) * radius,
  }
}

export function getDirectedEdgePoints(from: RenderedNode, to: RenderedNode) {
  return [getPointOnNodeEdge(from, to), getPointOnNodeEdge(to, from)]
}

function getLineBasis(from: Point, to: Point) {
  const deltaX = to.x - from.x
  const deltaY = to.y - from.y
  const distance = Math.hypot(deltaX, deltaY)

  if (distance === 0) {
    return null
  }

  return {
    distance,
    axis: {
      x: deltaX / distance,
      y: deltaY / distance,
    },
    normal: {
      x: -deltaY / distance,
      y: deltaX / distance,
    },
  }
}

export function getConnectedLinePoints(from: RenderedNode, to: RenderedNode, shape: ConnectedLinePoint[] = []) {
  const basis = getLineBasis(from, to)

  if (!basis) {
    return [{ x: from.x, y: from.y }]
  }

  const normalizedShape = shape.length
    ? shape
    : [
        { progress: 0, offsetRatio: 0 },
        { progress: 1, offsetRatio: 0 },
      ]

  const centerPoints = normalizedShape.map((point) => ({
    x: from.x + basis.axis.x * basis.distance * point.progress + basis.normal.x * basis.distance * point.offsetRatio,
    y: from.y + basis.axis.y * basis.distance * point.progress + basis.normal.y * basis.distance * point.offsetRatio,
  }))

  if (centerPoints.length > 1) {
    centerPoints[0] = getPointOnNodeEdge(from, centerPoints[1])
    centerPoints[centerPoints.length - 1] = getPointOnNodeEdge(to, centerPoints[centerPoints.length - 2])
  }

  return centerPoints
}

export function getConnectedShapeFromGesture(points: Point[], from: RenderedNode, to: RenderedNode): ConnectedLinePoint[] {
  const basis = getLineBasis(from, to)

  if (!basis) {
    return [
      { progress: 0, offsetRatio: 0 },
      { progress: 1, offsetRatio: 0 },
    ]
  }

  const fromRadius = getNodeRadius(from) * 1.1
  const toRadius = getNodeRadius(to) * 1.1
  const innerPoints: ConnectedLinePoint[] = []

  points.forEach((point) => {
    const isInsideEndpointNode =
      Math.hypot(point.x - from.x, point.y - from.y) < fromRadius || Math.hypot(point.x - to.x, point.y - to.y) < toRadius

    if (isInsideEndpointNode) {
      return
    }

    const relativePoint = {
      x: point.x - from.x,
      y: point.y - from.y,
    }
    const progress = (relativePoint.x * basis.axis.x + relativePoint.y * basis.axis.y) / basis.distance

    if (progress <= 0 || progress >= 1) {
      return
    }

    innerPoints.push({
      progress,
      offsetRatio: clamp((relativePoint.x * basis.normal.x + relativePoint.y * basis.normal.y) / basis.distance, -0.55, 0.55),
    })
  })

  innerPoints.sort((firstPoint, secondPoint) => firstPoint.progress - secondPoint.progress)

  const reducedPoints = innerPoints.filter((point, index) => {
    const previousPoint = innerPoints[index - 1]

    return !previousPoint || Math.abs(point.progress - previousPoint.progress) > 0.025
  })

  return [
    { progress: 0, offsetRatio: 0 },
    ...reducedPoints,
    { progress: 1, offsetRatio: 0 },
  ]
}

export function trimLineBeforeArrow(points: Point[]) {
  if (points.length < 2) {
    return points
  }

  const trimmedPoints = [...points]
  const end = trimmedPoints[trimmedPoints.length - 1]

  for (let index = trimmedPoints.length - 2; index >= 0; index -= 1) {
    const start = trimmedPoints[index]
    const distance = Math.hypot(end.x - start.x, end.y - start.y)

    if (distance <= ARROW_LINE_TRIM) {
      continue
    }

    trimmedPoints[trimmedPoints.length - 1] = {
      x: end.x - ((end.x - start.x) / distance) * ARROW_LINE_TRIM,
      y: end.y - ((end.y - start.y) / distance) * ARROW_LINE_TRIM,
    }

    return trimmedPoints
  }

  return trimmedPoints
}
