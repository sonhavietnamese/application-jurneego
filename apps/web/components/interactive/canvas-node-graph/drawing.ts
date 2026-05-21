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
  const s = size / 134
  const t = (v: number) => (v - 67) * s

  ctx.beginPath()
  ctx.moveTo(t(51.97), t(6.18))

  // Top bump
  ctx.bezierCurveTo(t(60.21), t(-2.06), t(73.57), t(-2.06), t(81.81), t(6.18))
  ctx.lineTo(t(89.04), t(13.41))
  ctx.lineTo(t(99.27), t(13.41))

  // Top-right corner
  ctx.bezierCurveTo(t(110.92), t(13.41), t(120.37), t(22.86), t(120.37), t(34.51))
  ctx.lineTo(t(120.37), t(44.74))
  ctx.lineTo(t(127.6), t(51.97))

  // Right bump
  ctx.bezierCurveTo(t(135.84), t(60.21), t(135.84), t(73.57), t(127.6), t(81.81))
  ctx.lineTo(t(120.37), t(89.04))
  ctx.lineTo(t(120.37), t(99.27))

  // Bottom-right corner
  ctx.bezierCurveTo(t(120.37), t(110.92), t(110.92), t(120.37), t(99.27), t(120.37))
  ctx.lineTo(t(89.04), t(120.37))
  ctx.lineTo(t(81.81), t(127.6))

  // Bottom bump
  ctx.bezierCurveTo(t(73.57), t(135.84), t(60.21), t(135.84), t(51.97), t(127.6))
  ctx.lineTo(t(44.74), t(120.37))
  ctx.lineTo(t(34.51), t(120.37))

  // Bottom-left corner
  ctx.bezierCurveTo(t(22.86), t(120.37), t(13.41), t(110.92), t(13.41), t(99.27))
  ctx.lineTo(t(13.41), t(89.04))
  ctx.lineTo(t(6.18), t(81.81))

  // Left bump
  ctx.bezierCurveTo(t(-2.06), t(73.57), t(-2.06), t(60.21), t(6.18), t(51.97))
  ctx.lineTo(t(13.41), t(44.74))
  ctx.lineTo(t(13.41), t(34.51))

  // Top-left corner
  ctx.bezierCurveTo(t(13.41), t(22.86), t(22.86), t(13.41), t(34.51), t(13.41))
  ctx.lineTo(t(44.74), t(13.41))
  ctx.lineTo(t(51.97), t(6.18))

  ctx.closePath()
}

function drawTriangle(ctx: CanvasRenderingContext2D, size: number, cornerRadius: number = 18) {
  const radius = size / 1.9

  // Calculate the 3 corner points
  const points = Array.from({ length: 3 }, (_, index) => {
    const angle = -Math.PI / 2 + index * ((Math.PI * 2) / 3)
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  })

  ctx.beginPath()

  for (let i = 0; i < 3; i++) {
    const prev = points[(i + 2) % 3]
    const current = points[i]
    const next = points[(i + 1) % 3]

    // arcTo needs a start point on the incoming edge, so we move
    // slightly away from the corner toward the previous point
    const startX = current.x + (prev.x - current.x) * 0.1
    const startY = current.y + (prev.y - current.y) * 0.1

    if (i === 0) {
      ctx.moveTo(startX, startY)
    } else {
      ctx.lineTo(startX, startY)
    }

    // arcTo rounds the corner: it draws an arc tangent to both
    // the incoming edge and the outgoing edge
    ctx.arcTo(current.x, current.y, next.x, next.y, cornerRadius)
  }

  ctx.closePath()
}

export function drawNodeShape(ctx: CanvasRenderingContext2D, node: CanvasNode, size: number) {
  ctx.beginPath()

  if (node.shape === 'circle') {
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
  }

  if (node.shape === 'square') {
    roundedRectangle(ctx, size * 0.96, size * 0.96, 28)
  }

  if (node.shape === 'triangle') {
    drawTriangle(ctx, size * 1.25)
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

export function drawNodeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scale: number,
  maxWidth: number = 120, // max line width in unscaled pixels
  lineHeight: number = 24
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#ffffff'
  ctx.font = '20px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lines = wrapText(ctx, text, maxWidth)
  const totalHeight = lines.length * lineHeight
  const startY = -totalHeight / 2 + lineHeight / 2 // vertically center the block

  lines.forEach((line, index) => {
    ctx.fillText(line, 0, startY + index * lineHeight)
  })

  ctx.restore()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const { width } = ctx.measureText(testLine)

    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
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
