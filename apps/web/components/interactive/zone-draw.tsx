'use client'

import { useRef, useState } from 'react'

import { DrawModeButton } from './canvas-node-graph/draw-mode-button'
import { useNodeCanvas } from './canvas-node-graph/use-node-canvas'

export default function ZoneDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const { isDraggingNode, pointerHandlers } = useNodeCanvas({
    canvasRef,
    wrapperRef,
    isDrawingMode,
  })

  return (
    <div className="pt-5 absolute w-[80%] h-screen top-0 right-0 min-h-0 gap-4 z-30">
      <div className="w-full flex items-center justify-between p-5">
        <div />
        <DrawModeButton isDrawingMode={isDrawingMode} onClick={() => setIsDrawingMode((current) => !current)} />
      </div>

      <section ref={wrapperRef} className="relative h-full w-full">
        <canvas
          ref={canvasRef}
          aria-label="Floating canvas node graph"
          className={`block h-full w-full touch-none ${
            isDrawingMode ? 'cursor-crosshair' : isDraggingNode ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          {...pointerHandlers}
        />
      </section>
    </div>
  )
}
