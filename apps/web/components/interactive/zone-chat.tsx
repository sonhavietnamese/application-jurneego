'use client'

import { useSmoothScrollToBottom } from '@/hooks/use-smooth-scroll-to-bottom'
import { getDisplayMessageText, getSpawnNodesFromMessage } from '@/lib/chat-node-payload'
import { PRELOAD_MVP } from '@/lib/constants'
import { useConnectionFeedbackStore } from '@/stores/connection-feedback-store'
import { useNodeGraphStore } from '@/stores/node-graph-store'
import { useChat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import AssistantAvatar from '../chat/assistant-avatar'
import Chatbox from '../chat/chatbox'
import { StreamingText } from '../chat/streaming-text'
import { Shimmer } from '../shimmer'

const initialMessages = PRELOAD_MVP.initialConversation.map(
  (message, index): UIMessage => ({
    id: `initial-${index}`,
    role: message.role,
    parts: [{ type: 'text', text: message.content }],
  })
)

export default function ZoneChat() {
  const [input, setInput] = useState('')
  const { messages, setMessages, sendMessage, status, stop, error } = useChat({ messages: initialMessages })
  const addNodes = useNodeGraphStore((state) => state.addNodes)
  const guidanceMessages = useConnectionFeedbackStore((state) => state.guidanceMessages)
  const processedNodeMessageIdsRef = useRef(new Set<string>())
  const processedGuidanceMessageIdsRef = useRef(new Set<string>())
  const isSending = status === 'submitted' || status === 'streaming'

  const visibleMessages = useMemo(
    () => messages.filter((message) => getDisplayMessageText(message).trim().length > 0),
    [messages]
  )
  const lastMessage = visibleMessages.at(-1)
  const lastMessageId = lastMessage?.id
  const lastMessageText = lastMessage ? getDisplayMessageText(lastMessage) : ''
  const scrollAreaRef = useSmoothScrollToBottom(`${lastMessageId}-${lastMessageText.length}-${status}`)

  useEffect(() => {
    if (isSending) {
      return
    }

    messages.forEach((message) => {
      if (processedNodeMessageIdsRef.current.has(message.id)) {
        return
      }

      const spawnNodes = getSpawnNodesFromMessage(message)

      if (spawnNodes.length > 0) {
        addNodes(spawnNodes)
      }

      processedNodeMessageIdsRef.current.add(message.id)
    })
  }, [addNodes, isSending, messages])

  useEffect(() => {
    const newGuidanceMessages = guidanceMessages.filter(
      (guidanceMessage) => !processedGuidanceMessageIdsRef.current.has(guidanceMessage.id)
    )

    if (newGuidanceMessages.length === 0) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      ...newGuidanceMessages.map(
        (guidanceMessage): UIMessage => ({
          id: guidanceMessage.id,
          role: 'assistant',
          parts: [{ type: 'text', text: guidanceMessage.content }],
        })
      ),
    ])

    newGuidanceMessages.forEach((guidanceMessage) => {
      processedGuidanceMessageIdsRef.current.add(guidanceMessage.id)
    })
  }, [guidanceMessages, setMessages])

  function handleSend() {
    const text = input.trim()

    if (!text || isSending) {
      return
    }

    setInput('')
    void sendMessage({ text })
  }

  return (
    <div className="p-5 col-span-3 pb-0 grid grid-rows-[min-content_1fr_auto] gap-4 h-full overflow-hidden">
      <div className="w-full h-10 flex items-center justify-between">
        <h2 className="font-semibold text-[26px]">{PRELOAD_MVP.title}</h2>
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
              <AnimatePresence>
                {visibleMessages.map((message) => {
                  const text = getDisplayMessageText(message)
                  const isUser = message.role === 'user'
                  const initialMessageIndex = message.id.startsWith('initial-')
                    ? Number.parseInt(message.id.replace('initial-', ''), 10)
                    : -1
                  const isStreamingAssistant =
                    message.role === 'assistant' && message.id === lastMessageId && status === 'streaming'

                  return (
                    <motion.li
                      key={message.id}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      className={isUser ? 'w-full flex justify-end' : 'w-full items-start inline-block'}
                      exit={{ opacity: 0, y: -5 }}
                      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                      transition={{
                        delay: initialMessageIndex >= 0 ? initialMessageIndex * 0.12 : 0,
                        duration: initialMessageIndex >= 0 ? 0.48 : 0.34,
                        ease: [0.22, 1, 0.36, 1],
                      }}
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
