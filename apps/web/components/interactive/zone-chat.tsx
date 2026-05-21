'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Chatbox from '../chat/chatbox'
import { Shimmer } from '../shimmer'
import AssistantAvatar from '../chat/assistant-avatar'
import { StreamingText } from '../chat/streaming-text'
import { getMessageText } from '@/lib/utils'

function useSmoothScrollToBottom(dependency: unknown) {
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

export default function ZoneChat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, stop, error } = useChat()
  const isSending = status === 'submitted' || status === 'streaming'

  const visibleMessages = useMemo(
    () => messages.filter((message) => getMessageText(message).trim().length > 0),
    [messages]
  )
  const lastMessage = visibleMessages.at(-1)
  const lastMessageId = lastMessage?.id
  const lastMessageText = lastMessage ? getMessageText(lastMessage) : ''
  const scrollAreaRef = useSmoothScrollToBottom(`${lastMessageId}-${lastMessageText.length}-${status}`)

  function handleSend() {
    const text = input.trim()

    if (!text || isSending) {
      return
    }

    setInput('')
    void sendMessage({ text })
  }

  return (
    <div className="py-5 col-span-3 pb-0 grid grid-rows-[min-content_1fr_auto] gap-4 h-full overflow-hidden">
      <div className="w-full h-10 flex items-center justify-between">
        <h2 className="font-semibold text-[26px]">Ethiopia Exploration!</h2>
        <button className="p-3 bg-[#EFEFEF] rounded-2xl flex gap-3 items-center justify-center px-5 z-50 relative">
          <span className="text-base text-[#706E69]">Scientist Lens</span>
          <figure className="w-3 aspect-square">
            <svg
              className="w-full h-full"
              width="10"
              height="7"
              viewBox="0 0 10 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1L5.17391 5L9 1" stroke="#706E69" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </figure>
        </button>
      </div>

      <div className="relative min-h-0">
        <div className="absolute top-0 left-0 w-full h-[100px] z-30 bg-linear-to-b from-[#f7f9f8] to-transparent pointer-events-none" />

        <div ref={scrollAreaRef} id="chat-zone" className="w-full h-full overflow-y-auto hide-scrollbar pt-20">
          <ul className="w-full text-[#484545] text-base space-y-4 hide-scrollbar">
            {visibleMessages.length === 0 ? (
              <motion.li
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                className="w-full items-start inline-block"
                initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="grid grid-cols-[auto_1fr] gap-4 w-[80%]">
                  <AssistantAvatar />

                  <div className="leading-tight min-w-[280px] max-w-[600px] w-full overflow-hidden hide-scrollbar">
                    Hi, I&apos;m ready to explore Ethiopia with you. Ask a question, share an idea, or tell me what you
                    want to investigate next.
                  </div>
                </div>
              </motion.li>
            ) : (
              <AnimatePresence initial={false}>
                {visibleMessages.map((message) => {
                  const text = getMessageText(message)
                  const isUser = message.role === 'user'
                  const isStreamingAssistant =
                    message.role === 'assistant' && message.id === lastMessageId && status === 'streaming'

                  return (
                    <motion.li
                      key={message.id}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      className={isUser ? 'w-full flex justify-end' : 'w-full items-start inline-block'}
                      exit={{ opacity: 0, y: -5 }}
                      initial={{ opacity: 0, y: isUser ? 5 : 8, filter: 'blur(4px)' }}
                      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {isUser ? (
                        <motion.div className="w-[80%] self-end flex justify-end">
                          <motion.div
                            className="leading-tight whitespace-pre-wrap bg-[#F2F2F3] p-4 rounded-2xl px-5 self-end w-fit max-w-[600px]"
                            whileHover={{ y: -1 }}
                          >
                            {text}
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="grid grid-cols-[auto_1fr] gap-4 w-[80%]">
                          <AssistantAvatar />

                          <motion.div className="leading-tight whitespace-pre-wrap min-w-[280px] max-w-[600px] w-full overflow-hidden hide-scrollbar rounded-2xl py-1">
                            <StreamingText text={text} isStreaming={isStreamingAssistant} />
                          </motion.div>
                        </div>
                      )}
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            )}

            <AnimatePresence>
              {status === 'submitted' ? (
                <motion.li
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  className="w-full items-start inline-block"
                  exit={{ opacity: 0, y: 0, filter: 'blur(3px)' }}
                  initial={{ opacity: 0, y: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="grid grid-cols-[auto_1fr] gap-4 w-[80%]">
                    <AssistantAvatar />

                    <div className="flex items-center gap-3">
                      <Shimmer className="leading-tight text-[#706E69]" duration={1}>
                        Thinking...
                      </Shimmer>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((dot) => (
                          <motion.span
                            key={dot}
                            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                            className="h-1.5 w-1.5 rounded-full bg-[#706E69]"
                            transition={{
                              delay: dot * 0.12,
                              duration: 0.8,
                              ease: 'easeInOut',
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.li>
              ) : null}
            </AnimatePresence>

            {error ? <li className="text-sm text-red-600">Chat failed: {error.message}</li> : null}
          </ul>
        </div>
      </div>

      <div className="flex">
        <Chatbox input={input} isSending={isSending} onInputChange={setInput} onSend={handleSend} onStop={stop} />
      </div>
    </div>
  )
}
