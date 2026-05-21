import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

export function useSmoothScrollToBottom(dependency: unknown) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const scrollArea = scrollAreaRef.current

    if (!scrollArea) {
      return
    }

    if (prefersReducedMotion) {
      scrollArea.scrollTop = scrollArea.scrollHeight
      return
    }

    const scrollElement = scrollArea
    const start = scrollElement.scrollTop
    const end = scrollElement.scrollHeight - scrollElement.clientHeight
    const distance = end - start
    const duration = Math.min(520, Math.max(220, Math.abs(distance) * 0.35))
    let animationFrame = 0
    let startTime: number | null = null

    function animateScroll(timestamp: number) {
      if (startTime === null) {
        startTime = timestamp
      }

      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      scrollElement.scrollTop = start + distance * easedProgress

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateScroll)
      }
    }

    animationFrame = requestAnimationFrame(animateScroll)

    return () => cancelAnimationFrame(animationFrame)
  }, [dependency, prefersReducedMotion])

  return scrollAreaRef
}
