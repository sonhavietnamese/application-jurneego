import { useMemo } from 'react'
import { motion } from 'motion/react'
import StreamingCaret from './streaming-caret'

export function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const parts = useMemo(() => text.match(/\S+\s*/g) ?? [], [text])

  if (!isStreaming) {
    return text
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
          {part}
        </motion.span>
      ))}
      <StreamingCaret />
    </>
  )
}
