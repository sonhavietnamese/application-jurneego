'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

type ShapeKind = 'flower' | 'circle' | 'square' | 'triangle'

type CanvasNode = {
  id: string
  text: string
  shape: ShapeKind
  x: number
  y: number
  size: number
  phase: number
  rotation: number
}

type RenderedNode = CanvasNode & {
  scale: number
  visible: boolean
}

type Point = {
  x: number
  y: number
}

type DrawnLine = {
  points: Point[]
  startNodeId?: string
  endNodeId?: string
}

type DragState = {
  nodeId: string
  offset: Point
}

const NODE_FILL = '#005f5d'
const CONNECTION_STROKE = '#557b78'
const USER_LINE_STROKE = '#0f766e'

const NODE_APPEAR_MS = 680
const NODE_STAGGER_MS = 105
const EDGE_DASH_SPEED = 24

const connections: Array<[string, string]> = [
  ['node-1', 'node-2'],
  ['node-1', 'node-4'],
  ['node-3', 'node-4'],
  ['node-3', 'node-5'],
  ['node-3', 'node-6'],
  ['node-4', 'node-7'],
]

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function easeOutBack(value: number) {
  const c1 = 1.70158
  const c3 = c1 + 1

  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2)
}

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

function drawNodeShape(ctx: CanvasRenderingContext2D, node: CanvasNode, size: number) {
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

function drawNodeHalo(ctx: CanvasRenderingContext2D, node: RenderedNode, color: string, alpha: number) {
  ctx.save()
  ctx.translate(node.x, node.y)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(0, 0, node.size * node.scale * 0.62 + 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawNodeText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number) {
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

function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point {
  const bounds = canvas.getBoundingClientRect()

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

function drawLinePath(ctx: CanvasRenderingContext2D, points: Point[]) {
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

function getNodeRadius(node: RenderedNode) {
  return node.size * node.scale * 0.55
}

function getPointOnNodeEdge(node: RenderedNode, toward: Point) {
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

function getDirectedEdgePoints(from: RenderedNode, to: RenderedNode) {
  return [getPointOnNodeEdge(from, to), getPointOnNodeEdge(to, from)]
}

function trimConnectedLinePoints(points: Point[], startNode: RenderedNode | null, endNode: RenderedNode | null) {
  const trimmedPoints = [...points]

  if (startNode?.visible && trimmedPoints.length > 1) {
    trimmedPoints[0] = getPointOnNodeEdge(startNode, trimmedPoints[1])
  }

  if (endNode?.visible && trimmedPoints.length > 1) {
    trimmedPoints[trimmedPoints.length - 1] = getPointOnNodeEdge(endNode, trimmedPoints[trimmedPoints.length - 2])
  }

  return trimmedPoints
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

function drawArrowHead(ctx: CanvasRenderingContext2D, points: Point[]) {
  const segment = getArrowSegment(points)

  if (!segment) {
    return
  }

  const angle = Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x)
  const size = 14

  ctx.save()
  ctx.translate(segment.end.x, segment.end.y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-size, -size * 0.46)
  ctx.lineTo(-size, size * 0.46)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export default function ZoneDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const drawnLinesRef = useRef<DrawnLine[]>([])
  const nodePositionsRef = useRef<Record<string, Point> | null>(null)
  const latestNodesRef = useRef<RenderedNode[]>([])
  const canvasSizeRef = useRef({ width: 0, height: 0 })
  const dragStateRef = useRef<DragState | null>(null)
  const activeLineIndexRef = useRef<number | null>(null)
  const activeStartNodeIdRef = useRef<string | null>(null)
  const activeEndNodeIdRef = useRef<string | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [isDraggingNode, setIsDraggingNode] = useState(false)

  const nodes = useMemo<CanvasNode[]>(
    () => [
      { id: 'node-1', text: 'Node 1', shape: 'flower', x: 0.29, y: 0.42, size: 142, phase: 0.2, rotation: -0.08 },
      { id: 'node-2', text: 'Node 2', shape: 'circle', x: 0.2, y: 0.78, size: 120, phase: 1.4, rotation: 0 },
      { id: 'node-3', text: 'Node 3', shape: 'circle', x: 0.62, y: 0.21, size: 114, phase: 2.3, rotation: 0 },
      { id: 'node-4', text: 'Node 4', shape: 'triangle', x: 0.7, y: 0.61, size: 126, phase: 3.2, rotation: -0.2 },
      { id: 'node-5', text: 'Node 5', shape: 'circle', x: 0.92, y: 0.42, size: 108, phase: 4.1, rotation: 0 },
      { id: 'node-6', text: 'Node 6', shape: 'square', x: 0.92, y: 0.18, size: 106, phase: 5, rotation: -0.08 },
      { id: 'node-7', text: 'Node 7', shape: 'circle', x: 0.84, y: 0.82, size: 118, phase: 5.7, rotation: 0 },
    ],
    [],
  )

  if (nodePositionsRef.current === null) {
    nodePositionsRef.current = Object.fromEntries(nodes.map((node) => [node.id, { x: node.x, y: node.y }]))
  }

  const findNodeAtPoint = useCallback((point: Point) => {
    const renderedNodes = latestNodesRef.current

    for (let index = renderedNodes.length - 1; index >= 0; index -= 1) {
      const node = renderedNodes[index]

      if (!node.visible) {
        continue
      }

      const hitRadius = node.size * node.scale * 0.58
      const distance = Math.hypot(point.x - node.x, point.y - node.y)

      if (distance <= hitRadius) {
        return node
      }
    }

    return null
  }, [])

  const getAnimatedNode = useCallback(
    (node: CanvasNode, width: number, height: number, now: number, startedAt: number, index: number) => {
      const position = nodePositionsRef.current?.[node.id] ?? { x: node.x, y: node.y }
      const progress = clamp((now - startedAt - index * NODE_STAGGER_MS) / NODE_APPEAR_MS)
      const scale = 0.2 + easeOutBack(progress) * 0.8
      const floatY = Math.sin(now / 760 + node.phase) * 7
      const rotation = node.rotation + Math.sin(now / 1050 + node.phase) * 0.12

      return {
        ...node,
        x: position.x * width,
        y: position.y * height + floatY,
        scale,
        rotation,
        visible: progress > 0,
      }
    },
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current

    if (!canvas || !wrapper) {
      return
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    let width = 0
    let height = 0
    let animationFrame = 0
    const startedAt = performance.now()

    const resize = () => {
      const bounds = wrapper.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      width = bounds.width
      height = bounds.height
      canvasSizeRef.current = { width, height }
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(wrapper)
    resize()

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height)

      const animatedNodes = nodes.map((node, index) => getAnimatedNode(node, width, height, now, startedAt, index))
      const nodesById = new Map(animatedNodes.map((node) => [node.id, node]))
      latestNodesRef.current = animatedNodes

      ctx.save()
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.strokeStyle = CONNECTION_STROKE
      ctx.globalAlpha = 0.9
      ctx.setLineDash([12, 17])

      connections.forEach(([fromId, toId]) => {
        const from = nodesById.get(fromId)
        const to = nodesById.get(toId)

        if (!from?.visible || !to?.visible) {
          return
        }

        const edgePoints = getDirectedEdgePoints(from, to)

        ctx.beginPath()
        ctx.lineDashOffset = -now / EDGE_DASH_SPEED
        drawLinePath(ctx, edgePoints)
        ctx.fillStyle = CONNECTION_STROKE
        drawArrowHead(ctx, edgePoints)
      })
      ctx.restore()

      drawnLinesRef.current.forEach((line) => {
        if (line.points.length < 2) {
          return
        }

        const linePoints = [...line.points]
        const startNode = line.startNodeId ? nodesById.get(line.startNodeId) : null
        const endNode = line.endNodeId ? nodesById.get(line.endNodeId) : null
        const isConnectedLine = Boolean(startNode?.visible && endNode?.visible)

        if (startNode?.visible) {
          linePoints[0] = { x: startNode.x, y: startNode.y }
        }

        if (endNode?.visible) {
          linePoints[linePoints.length - 1] = { x: endNode.x, y: endNode.y }
        }

        const visibleLinePoints = trimConnectedLinePoints(linePoints, startNode ?? null, endNode ?? null)

        ctx.save()
        ctx.lineWidth = isConnectedLine ? 5 : 4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = USER_LINE_STROKE
        ctx.fillStyle = USER_LINE_STROKE
        ctx.globalAlpha = isConnectedLine ? 0.95 : 0.86
        ctx.setLineDash(isConnectedLine ? [14, 14] : [10, 12])
        ctx.lineDashOffset = isConnectedLine ? -now / EDGE_DASH_SPEED : 0
        drawLinePath(ctx, visibleLinePoints)
        if (isConnectedLine) {
          drawArrowHead(ctx, visibleLinePoints)
        }
        ctx.restore()
      })

      animatedNodes.forEach((node) => {
        if (!node.visible) {
          return
        }

        if (node.id === activeStartNodeIdRef.current) {
          drawNodeHalo(ctx, node, '#4fd1c5', 0.34)
        } else if (node.id === activeEndNodeIdRef.current || node.id === dragStateRef.current?.nodeId) {
          drawNodeHalo(ctx, node, '#b2f5ea', 0.3)
        }

        const size = node.size * node.scale

        ctx.save()
        ctx.translate(node.x, node.y)
        ctx.rotate(node.rotation)
        ctx.shadowColor = 'rgba(0, 95, 93, 0.16)'
        ctx.shadowBlur = 18
        ctx.shadowOffsetY = 10
        drawNodeShape(ctx, node, size)
        ctx.restore()

        drawNodeText(ctx, node.text, node.x, node.y, node.scale)
      })

      animationFrame = requestAnimationFrame(render)
    }

    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [getAnimatedNode, nodes])

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) {
        return
      }

      const point = getCanvasPoint(event, canvasRef.current)
      const hitNode = findNodeAtPoint(point)

      if (!isDrawingMode) {
        if (!hitNode) {
          return
        }

        event.currentTarget.setPointerCapture(event.pointerId)
        dragStateRef.current = {
          nodeId: hitNode.id,
          offset: {
            x: point.x - hitNode.x,
            y: point.y - hitNode.y,
          },
        }
        setIsDraggingNode(true)
        return
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      activeStartNodeIdRef.current = hitNode?.id ?? null
      activeEndNodeIdRef.current = null
      drawnLinesRef.current.push({ points: [point], startNodeId: hitNode?.id })
      activeLineIndexRef.current = drawnLinesRef.current.length - 1
    },
    [findNodeAtPoint, isDrawingMode],
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) {
        return
      }

      const point = getCanvasPoint(event, canvasRef.current)

      if (!isDrawingMode) {
        const dragState = dragStateRef.current

        if (!dragState || !nodePositionsRef.current) {
          return
        }

        const { width, height } = canvasSizeRef.current

        if (width === 0 || height === 0) {
          return
        }

        nodePositionsRef.current[dragState.nodeId] = {
          x: clamp((point.x - dragState.offset.x) / width, 0.08, 0.94),
          y: clamp((point.y - dragState.offset.y) / height, 0.08, 0.92),
        }
        return
      }

      if (activeLineIndexRef.current === null) {
        return
      }

      const hitNode = findNodeAtPoint(point)
      activeEndNodeIdRef.current =
        hitNode && hitNode.id !== activeStartNodeIdRef.current && activeStartNodeIdRef.current ? hitNode.id : null

      const activeLine = drawnLinesRef.current[activeLineIndexRef.current]

      if (!activeLine) {
        return
      }

      const previousPoint = activeLine.points[activeLine.points.length - 1]
      const distance = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y)

      if (distance > 4) {
        activeLine.points.push(point)
      }
    },
    [findNodeAtPoint, isDrawingMode],
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      setIsDraggingNode(false)
      dragStateRef.current = null

      if (!isDrawingMode || !canvasRef.current || activeLineIndexRef.current === null) {
        activeLineIndexRef.current = null
        activeStartNodeIdRef.current = null
        activeEndNodeIdRef.current = null
        return
      }

      const point = getCanvasPoint(event, canvasRef.current)
      const hitNode = findNodeAtPoint(point)
      const activeLine = drawnLinesRef.current[activeLineIndexRef.current]

      if (activeLine) {
        if (activeLine.points.length === 1) {
          activeLine.points.push(point)
        }

        if (activeLine.startNodeId && hitNode && hitNode.id !== activeLine.startNodeId) {
          activeLine.endNodeId = hitNode.id
          activeLine.points[activeLine.points.length - 1] = { x: hitNode.x, y: hitNode.y }

          const startNode = latestNodesRef.current.find((node) => node.id === activeLine.startNodeId)
          console.log('Connected nodes', {
            from: startNode,
            to: hitNode,
          })
        }

        if (activeLine.points.length < 2 || Math.hypot(point.x - activeLine.points[0].x, point.y - activeLine.points[0].y) < 6) {
          drawnLinesRef.current.splice(activeLineIndexRef.current, 1)
        }
      }

      activeLineIndexRef.current = null
      activeStartNodeIdRef.current = null
      activeEndNodeIdRef.current = null
    },
    [findNodeAtPoint, isDrawingMode],
  )

  const handlePointerCancel = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    setIsDraggingNode(false)
    dragStateRef.current = null
    activeLineIndexRef.current = null
    activeStartNodeIdRef.current = null
    activeEndNodeIdRef.current = null
  }, [])

  return (
    <div className="pt-5 col-span-2 h-full min-h-0 grid grid-rows-[40px_1fr] gap-4">
      <div className="w-full h-10 flex items-center justify-between">
        <div>
          <figure className="w-auto h-[8px]">
            <svg
              className="w-full h-full"
              width="62"
              height="11"
              viewBox="0 0 62 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.69763 8.97494L5.55869 4.23115C8.25041 0.924053 13.4212 1.34138 15.5477 5.03735L15.6545 5.22293C17.8906 9.10939 23.4953 9.16309 25.8872 5.37053C28.2001 1.70321 33.5901 1.66822 35.8737 5.35381C38.2237 9.14647 43.7792 9.03265 45.9718 5.14694L46.1667 4.80157C48.2223 1.15886 53.2501 0.616899 56.0347 3.73787L59.6976 7.84323"
                stroke="#E0DED7"
                strokeWidth="3.39512"
                strokeLinecap="round"
              />
            </svg>
          </figure>
        </div>
        <button
          type="button"
          aria-pressed={isDrawingMode}
          aria-label={isDrawingMode ? 'Stop drawing lines' : 'Draw lines'}
          title={isDrawingMode ? 'Stop drawing lines' : 'Draw lines'}
          onClick={() => setIsDrawingMode((current) => !current)}
          className={`p-2 mr-5 pl-[11px] pr-[4.5px] rounded-2xl border transition ${
            isDrawingMode ? 'bg-[#e7f5f2] border-[#85bbb5] shadow-sm' : 'bg-[#FDFDFD] border-[#EFEFEF]'
          }`}
        >
          <figure className="aspect-square">
            <svg
              className="w-full h-full"
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_2053_124"
                style={{ maskType: 'luminance' }}
                maskUnits="userSpaceOnUse"
                x="2"
                y="3"
                width="22"
                height="24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.44325 3.66449H23.4281V26.7978H2.44325V3.66449Z"
                  fill="white"
                />
              </mask>
              <g mask="url(#mask0_2053_124)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.0137 6.12767L4.51391 20.51C4.30504 20.7714 4.22809 21.1085 4.30504 21.4322L5.13684 24.956L8.84876 24.9096C9.20175 24.9059 9.52787 24.7484 9.74407 24.4796C13.6734 19.5634 21.1644 10.1901 21.377 9.91532C21.5773 9.59042 21.6554 9.13117 21.5504 8.68901C21.4429 8.23586 21.1608 7.85111 20.754 7.6056C20.6673 7.54575 18.6092 5.94812 18.5457 5.89805C17.7713 5.27756 16.6415 5.38505 16.0137 6.12767V6.12767ZM4.41375 26.7979C3.98992 26.7979 3.62104 26.5072 3.52211 26.0931L2.52176 21.8536C2.31534 20.9754 2.52054 20.0691 3.08362 19.3655L14.5895 4.97465C14.5944 4.96976 14.598 4.96365 14.6029 4.95877C15.8646 3.4503 18.1463 3.228 19.6853 4.46287C19.7463 4.5105 21.7898 6.09836 21.7898 6.09836C22.5324 6.54052 23.1126 7.33078 23.3325 8.2664C23.5511 9.19224 23.3923 10.1474 22.883 10.9548C22.8451 11.0146 22.8121 11.0659 11.1744 25.6253C10.6137 26.324 9.77338 26.7307 8.87074 26.7417L4.42597 26.7979H4.41375Z"
                  fill="black"
                />
              </g>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.8157 14.2721C19.6203 14.2721 19.4249 14.2098 19.2575 14.0828L12.5983 8.96748C12.1977 8.65968 12.1219 8.08561 12.4297 7.68253C12.7388 7.28191 13.3128 7.2074 13.7147 7.5152L20.3751 12.6293C20.7758 12.9371 20.8515 13.5124 20.5425 13.9143C20.3629 14.1488 20.0905 14.2721 19.8157 14.2721"
                fill="black"
              />
            </svg>
          </figure>
        </button>
      </div>

      <section ref={wrapperRef} className="relative min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-label="Floating canvas node graph"
          className={`block h-full w-full touch-none ${
            isDrawingMode ? 'cursor-crosshair' : isDraggingNode ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
        />
      </section>
    </div>
  )
}
