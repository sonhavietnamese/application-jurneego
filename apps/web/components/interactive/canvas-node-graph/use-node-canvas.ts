'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent, RefObject } from 'react'

import {
  CONNECTIONS,
  CONNECTION_STROKE,
  EDGE_DASH_SPEED,
  NODE_APPEAR_MS,
  NODE_STAGGER_MS,
  USER_LINE_STROKE,
} from './constants'
import { useConnectionFeedbackStore } from '@/stores/connection-feedback-store'
import { useNodeGraphStore } from '@/stores/node-graph-store'
import { drawArrowHead, drawLinePath, drawNodeHalo, drawNodeShape, drawNodeText } from './drawing'
import {
  clamp,
  easeOutBack,
  getConnectedLinePoints,
  getConnectedShapeFromGesture,
  getDirectedEdgePoints,
  trimLineBeforeArrow,
} from './geometry'
import type { CanvasNode, DragState, DrawnLine, Point, RenderedNode } from './types'

function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point {
  const bounds = canvas.getBoundingClientRect()

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

type UseNodeCanvasOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  wrapperRef: RefObject<HTMLDivElement | null>
  isDrawingMode: boolean
}

export function useNodeCanvas({ canvasRef, wrapperRef, isDrawingMode }: UseNodeCanvasOptions) {
  const drawnLinesRef = useRef<DrawnLine[]>([])
  const nodePositionsRef = useRef<Record<string, Point> | null>(null)
  const nodeIntroducedAtRef = useRef<Record<string, number>>({})
  const latestNodesRef = useRef<RenderedNode[]>([])
  const canvasSizeRef = useRef({ width: 0, height: 0 })
  const dragStateRef = useRef<DragState | null>(null)
  const activeLineIndexRef = useRef<number | null>(null)
  const activeStartNodeIdRef = useRef<string | null>(null)
  const activeEndNodeIdRef = useRef<string | null>(null)
  const candidateEndNodeIdRef = useRef<string | null>(null)
  const [isDraggingNode, setIsDraggingNode] = useState(false)

  const nodes = useNodeGraphStore((state) => state.nodes)
  const addGuidance = useConnectionFeedbackStore((state) => state.addGuidance)
  const showNotification = useConnectionFeedbackStore((state) => state.showNotification)

  if (nodePositionsRef.current === null) {
    nodePositionsRef.current = Object.fromEntries(nodes.map((node) => [node.id, { x: node.x, y: node.y }]))
  }

  useEffect(() => {
    const positions = nodePositionsRef.current

    if (!positions) {
      return
    }

    const nodeIds = new Set(nodes.map((node) => node.id))

    nodes.forEach((node) => {
      positions[node.id] ??= { x: node.x, y: node.y }
    })

    Object.keys(positions).forEach((nodeId) => {
      if (!nodeIds.has(nodeId)) {
        delete positions[nodeId]
      }
    })
  }, [nodes])

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
      const introducedAtRef = nodeIntroducedAtRef.current
      const introducedAt =
        introducedAtRef[node.id] ??
        (Object.keys(introducedAtRef).length < nodes.length ? startedAt + index * NODE_STAGGER_MS : now)

      introducedAtRef[node.id] = introducedAt

      const progress = clamp((now - introducedAt) / NODE_APPEAR_MS)
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
    [nodes.length],
  )

  const resetActiveGesture = useCallback(() => {
    activeLineIndexRef.current = null
    activeStartNodeIdRef.current = null
    activeEndNodeIdRef.current = null
    candidateEndNodeIdRef.current = null
  }, [])

  const reviewNodeConnection = useCallback(
    async (from: CanvasNode, to: CanvasNode) => {
      try {
        const response = await fetch('/api/node-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: { id: from.id, text: from.text },
            to: { id: to.id, text: to.text },
          }),
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const review = (await response.json()) as {
          related?: boolean
          title?: string
          subtitle?: string
          guidance?: string
        }

        if (review.related) {
          showNotification({
            title: review.title?.trim() || 'Strong connection!',
            subtitle: review.subtitle?.trim() || `${from.text} and ${to.text} connect well.`,
          })
          return
        }

        addGuidance(
          review.guidance?.trim() ||
            `That connection needs one more step. Try explaining how <hl>${from.text}</hl> directly affects <hl>${to.text}</hl>.`
        )
      } catch (error) {
        console.error('Node connection review failed:', error)
        addGuidance(
          `I could not check that connection yet. Try asking: how does <hl>${from.text}</hl> explain or support <hl>${to.text}</hl>?`
        )
      }
    },
    [addGuidance, showNotification]
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

      CONNECTIONS.forEach(([fromId, toId]) => {
        const from = nodesById.get(fromId)
        const to = nodesById.get(toId)

        if (!from?.visible || !to?.visible) {
          return
        }

        const edgePoints = getDirectedEdgePoints(from, to)

        ctx.lineDashOffset = -now / EDGE_DASH_SPEED
        drawLinePath(ctx, trimLineBeforeArrow(edgePoints))
        ctx.fillStyle = CONNECTION_STROKE
        drawArrowHead(ctx, edgePoints)
      })
      ctx.restore()

      drawnLinesRef.current.forEach((line) => {
        if (line.points.length < 2) {
          return
        }

        const startNode = line.startNodeId ? nodesById.get(line.startNodeId) : null
        const endNode = line.endNodeId ? nodesById.get(line.endNodeId) : null
        const isConnectedLine = Boolean(startNode?.visible && endNode?.visible)
        const visibleLinePoints =
          startNode?.visible && endNode?.visible
            ? getConnectedLinePoints(startNode, endNode, line.connectedShape)
            : line.points

        ctx.save()
        ctx.lineWidth = isConnectedLine ? 5 : 4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = USER_LINE_STROKE
        ctx.fillStyle = USER_LINE_STROKE
        ctx.globalAlpha = isConnectedLine ? 0.95 : 0.86
        ctx.setLineDash(isConnectedLine ? [14, 14] : [10, 12])
        ctx.lineDashOffset = isConnectedLine ? -now / EDGE_DASH_SPEED : 0
        drawLinePath(ctx, isConnectedLine ? trimLineBeforeArrow(visibleLinePoints) : visibleLinePoints)
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
  }, [canvasRef, getAnimatedNode, nodes, wrapperRef])

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
      candidateEndNodeIdRef.current = null
      drawnLinesRef.current.push({ points: [point], startNodeId: hitNode?.id })
      activeLineIndexRef.current = drawnLinesRef.current.length - 1
    },
    [canvasRef, findNodeAtPoint, isDrawingMode],
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
      const targetNode =
        hitNode && hitNode.id !== activeStartNodeIdRef.current && activeStartNodeIdRef.current ? hitNode : null

      if (targetNode) {
        activeEndNodeIdRef.current = targetNode.id
        candidateEndNodeIdRef.current = targetNode.id
      }

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
    [canvasRef, findNodeAtPoint, isDrawingMode],
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      setIsDraggingNode(false)
      dragStateRef.current = null

      if (!isDrawingMode || !canvasRef.current || activeLineIndexRef.current === null) {
        resetActiveGesture()
        return
      }

      const point = getCanvasPoint(event, canvasRef.current)
      const directHitNode = findNodeAtPoint(point)
      const candidateHitNode = candidateEndNodeIdRef.current
        ? latestNodesRef.current.find((node) => node.id === candidateEndNodeIdRef.current)
        : null
      const activeLine = drawnLinesRef.current[activeLineIndexRef.current]
      const validDirectHitNode = directHitNode && directHitNode.id !== activeLine?.startNodeId ? directHitNode : null
      const hitNode = validDirectHitNode ?? candidateHitNode

      if (activeLine) {
        if (activeLine.points.length === 1) {
          activeLine.points.push(point)
        }

        if (activeLine.startNodeId && hitNode && hitNode.id !== activeLine.startNodeId) {
          const startNode = latestNodesRef.current.find((node) => node.id === activeLine.startNodeId)

          activeLine.endNodeId = hitNode.id
          activeLine.connectedShape = startNode ? getConnectedShapeFromGesture(activeLine.points, startNode, hitNode) : undefined
          activeLine.points = startNode
            ? [
                { x: startNode.x, y: startNode.y },
                { x: hitNode.x, y: hitNode.y },
              ]
            : activeLine.points

          console.log('Connected nodes', {
            from: startNode,
            to: hitNode,
          })

          if (startNode) {
            void reviewNodeConnection(startNode, hitNode)
          }
        }

        if (
          activeLine.points.length < 2 ||
          Math.hypot(point.x - activeLine.points[0].x, point.y - activeLine.points[0].y) < 6
        ) {
          drawnLinesRef.current.splice(activeLineIndexRef.current, 1)
        }
      }

      resetActiveGesture()
    },
    [canvasRef, findNodeAtPoint, isDrawingMode, resetActiveGesture, reviewNodeConnection],
  )

  const handlePointerCancel = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      setIsDraggingNode(false)
      dragStateRef.current = null
      resetActiveGesture()
    },
    [resetActiveGesture],
  )

  return {
    isDraggingNode,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerCancel,
    },
  }
}
