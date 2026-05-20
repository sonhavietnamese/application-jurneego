import { ARROW_SIZE, NODE_FILL } from './constants'
import type { CanvasNode, Point, RenderedNode } from './types'

function roundedRectangle(ctx: CanvasRenderingContext2D, width: number, height: number, radius: number) {
  const x = -width / 2
  const y = -height / 2
  const r = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawFlower(ctx: CanvasRenderingContext2D, size: number) {
  const points = 96
  const radius = size / 2

  ctx.beginPath()

  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * Math.PI * 2
    const petal = 0.88 + Math.sin(angle * 8) * 0.12
    const x = Math.cos(angle) * radius * petal
    const y = Math.sin(angle) * radius * petal

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
}

function drawTriangle(ctx: CanvasRenderingContext2D, size: number) {
  const radius = size / 1.9

  ctx.beginPath()
  for (let index = 0; index < 3; index += 1) {
    const angle = -Math.PI / 2 + index * ((Math.PI * 2) / 3)
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
}

export function drawNodeShape(ctx: CanvasRenderingContext2D, node: CanvasNode, size: number) {
  ctx.beginPath()

  if (node.shape === 'circle') {
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
  }

  if (node.shape === 'square') {
    roundedRectangle(ctx, size * 0.96, size * 0.96, 10)
  }

  if (node.shape === 'triangle') {
    drawTriangle(ctx, size)
  }

  if (node.shape === 'flower') {
    drawFlower(ctx, size)
  }

  ctx.fillStyle = NODE_FILL
  ctx.fill()
}

export function drawNodeHalo(ctx: CanvasRenderingContext2D, node: RenderedNode, color: string, alpha: number) {
  ctx.save()
  ctx.translate(node.x, node.y)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(0, 0, node.size * node.scale * 0.62 + 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawNodeText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#ffffff'
  ctx.font = '20px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

export function drawLinePath(ctx: CanvasRenderingContext2D, points: Point[]) {
  ctx.beginPath()

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y)
    } else {
      ctx.lineTo(point.x, point.y)
    }
  })

  ctx.stroke()
}

function getArrowSegment(points: Point[]) {
  const end = points[points.length - 1]

  for (let index = points.length - 2; index >= 0; index -= 1) {
    const start = points[index]

    if (Math.hypot(end.x - start.x, end.y - start.y) > 10) {
      return { start, end }
    }
  }

  return null
}

export function drawArrowHead(ctx: CanvasRenderingContext2D, points: Point[]) {
  const segment = getArrowSegment(points)

  if (!segment) {
    return
  }

  const angle = Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x)

  ctx.save()
  ctx.translate(segment.end.x, segment.end.y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-ARROW_SIZE, -ARROW_SIZE * 0.46)
  ctx.lineTo(-ARROW_SIZE, ARROW_SIZE * 0.46)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
