import { useMemo } from 'react'
import { motion } from 'motion/react'
import StreamingCaret from './streaming-caret'

type TextSegment = {
  id: string
  text: string
  highlighted: boolean
  highlightIndex?: number
}

function parseHighlightSegments(text: string) {
  const segments: TextSegment[] = []
  const regex = /<hl>([\s\S]*?)<\/hl>/gi
  let cursor = 0
  let match: RegExpExecArray | null
  let highlightIndex = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({
        id: `${cursor}-plain`,
        text: text.slice(cursor, match.index),
        highlighted: false,
      })
    }

    segments.push({
      id: `${match.index}-highlight`,
      text: match[1],
      highlighted: true,
      highlightIndex,
    })
    highlightIndex += 1

    cursor = match.index + match[0].length
  }

  if (cursor < text.length) {
    segments.push({
      id: `${cursor}-plain`,
      text: text.slice(cursor),
      highlighted: false,
    })
  }

  return segments
}

function HighlightedText({ children, index }: { children: string; index: number }) {
  return (
    <motion.span
      animate={{ backgroundSize: '100% 100%' }}
      className="inline rounded-[5px] px-1 py-0.5 box-decoration-clone [-webkit-box-decoration-break:clone]"
      initial={{ backgroundSize: '0% 100%' }}
      style={{
        backgroundImage: 'linear-gradient(90deg, #FFC122, #FFC122)',
        backgroundRepeat: 'no-repeat',
      }}
      transition={{
        delay: index * 0.12,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.span>
  )
}

function RenderHighlightedText({ text }: { text: string }) {
  const segments = useMemo(() => parseHighlightSegments(text), [text])

  return (
    <>
      {segments.map((segment) => {
        if (!segment.highlighted) {
          return <span key={segment.id}>{segment.text}</span>
        }

        return (
          <HighlightedText key={segment.id} index={segment.highlightIndex ?? 0}>
            {segment.text}
          </HighlightedText>
        )
      })}
    </>
  )
}

export function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const parts = useMemo(() => text.match(/\S+\s*/g) ?? [], [text])

  if (!isStreaming) {
    return <RenderHighlightedText text={text} />
  }

  return (
    <>
      {parts.map((part, index) => (
        <motion.span
          key={`${index}-${part}`}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          initial={{ opacity: 0, filter: 'blur(3px)' }}
          transition={{ duration: 0.1, ease: 'linear' }}
        >
          <RenderHighlightedText text={part} />
        </motion.span>
      ))}
      <StreamingCaret />
    </>
  )
}
