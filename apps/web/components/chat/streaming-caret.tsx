import { motion } from 'motion/react'

export default function StreamingCaret() {
  return (
    <motion.span
      animate={{ opacity: [0.25, 1, 0.25], y: [0, -1, 0] }}
      className="ml-1 inline-block h-4 w-1.5 rounded-full bg-[#005659] align-[-2px]"
      transition={{ duration: 1, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
    />
  )
}
