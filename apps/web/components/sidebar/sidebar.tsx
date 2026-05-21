'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

export default function Sidebar() {
  const ulRef = useRef<HTMLUListElement>(null)
  const [activeBadgeId, setActiveBadgeId] = useState<number | null>(null)
  const [line, setLine] = useState({ top: 0, height: 0 })

  const items = useMemo(
    () => [
      {
        id: 1,
        title: 'The Perspective Scout',
        description:
          'You looked at the same question through two different lenses (e.g., Scientist and Historian). Great job seeing the bigger picture!',
      },
      {
        id: 2,
        title: 'The Bridge Builder',
        description:
          "You didn't just guess; you linked at least 3 factual nodes to your main question. Your argument is now rock solid!",
      },
      {
        id: 3,
        title: 'The Thoughtful Reflector',
        description:
          "You connected two ideas that seemed unrelated at first. You're finding connections that others missed!",
      },
    ],
    []
  )

  useLayoutEffect(() => {
    const ul = ulRef.current
    if (!ul) return

    const updateLine = () => {
      const firstDot = ul.querySelector<HTMLElement>('#dot-0')
      const lastDot = ul.querySelector<HTMLElement>(`#dot-${items.length - 1}`)
      if (!firstDot || !lastDot) return

      const ulRect = ul.getBoundingClientRect()
      const firstRect = firstDot.getBoundingClientRect()
      const lastRect = lastDot.getBoundingClientRect()

      const top = firstRect.top + firstRect.height / 2 - ulRect.top
      const height = lastRect.top + lastRect.height / 2 - ulRect.top - top

      setLine((current) => (current.top === top && current.height === height ? current : { top, height }))
    }

    updateLine()

    const resizeObserver = new ResizeObserver(updateLine)
    resizeObserver.observe(ul)

    return () => resizeObserver.disconnect()
  }, [activeBadgeId, items.length])

  const lineHeight = Math.max(line.height, 1)

  return (
    <aside className="w-[360px] h-full bg-[#FCFCFC] border border-[#EFEFEF] rounded-4xl p-5">
      <figure>
        <Image alt="JurneeGo" src="/jurneego-logo.png" width={100} height={100} />
      </figure>

      <div className="mt-10">
        <h3 className="text-[#92908b] text-base">My Discoveries</h3>
      </div>

      <section>
        <ul ref={ulRef} className="relative list-none p-0 m-0">
          <motion.figure
            className="absolute left-[11.5px] w-[2.5px]"
            initial={false}
            animate={{ top: line.top }}
            transition={{ duration: 0.05, ease: 'easeOut' }}
          >
            <motion.svg
              width="2.5"
              height={lineHeight}
              viewBox={`0 0 2.5 ${lineHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              initial={false}
              animate={{ height: lineHeight }}
              transition={{ duration: 0.05, ease: 'easeOut' }}
            >
              <motion.path
                stroke="#D9D9D9"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="9 9"
                initial={false}
                animate={{ d: `M1 0V${lineHeight}` }}
                transition={{ duration: 0.05, ease: 'easeOut' }}
              />
            </motion.svg>
          </motion.figure>
          {items.map((item, index) => {
            const gradientId = `paint0_linear_2063_12313_${index}`
            const isActive = activeBadgeId === item.id

            return (
              <motion.li
                id={`badge-${index}`}
                key={item.id}
                className="relative grid grid-cols-[24px_1fr] mb-4 last:mb-0 mt-4 cursor-pointer select-none group"
                initial="rest"
                animate="rest"
                layout
                onClick={() => setActiveBadgeId((current) => (current === item.id ? null : item.id))}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  setActiveBadgeId((current) => (current === item.id ? null : item.id))
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                whileHover="hover"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="flex items-center justify-center">
                  <div
                    id={`dot-${index}`}
                    className={cn(
                      'w-[12px] aspect-square rounded-full z-10 relative',
                      'bg-[#FDFDFD] border-[2.5px] border-[#D9D9D9]',
                      'group-hover:bg-[#D9D9D9] transition-colors duration-150'
                    )}
                  ></div>
                </div>

                <motion.div
                  className="relative overflow-hidden ml-1 rounded-[20px] border border-[#EFEFEF] bg-white p-5 min-h-[110px]"
                  layout
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <h4 className="font-medium text-lg text-[#747171]">{item.title}</h4>
                  <motion.span
                    className="text-sm text-[#8a8989] leading-[1.1] block overflow-hidden"
                    initial={false}
                    animate={
                      isActive ? { height: 'auto', opacity: 1, marginTop: 8 } : { height: 0, opacity: 0, marginTop: 0 }
                    }
                    aria-hidden={!isActive}
                    transition={{
                      height: { duration: 0.2, ease: 'easeOut' },
                      opacity: { duration: 0.2, ease: 'easeOut' },
                      marginTop: { duration: 0.2, ease: 'easeOut' },
                    }}
                  >
                    {item.description}
                  </motion.span>
                  <div className="h-4 w-2/3 rounded-md bg-gray-200 mt-6 overflow-hidden">
                    <div className="h-full bg-red-300 rounded-md " style={{ width: `${20}%` }}></div>
                  </div>

                  <figure
                    className={cn(
                      'absolute -bottom-10 -right-10 w-28 aspect-square',
                      'group-hover:-rotate-12 rotate-0 transition-transform duration-150'
                      // 'group-hover:animate-spin rotate-0 transition-transform duration-1000'
                    )}
                  >
                    <svg
                      className="w-full h-full"
                      width="132"
                      height="132"
                      viewBox="0 0 132 132"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M38.2504 9.7239C44.5327 -0.0883654 57.5803 -2.95031 67.3926 3.33187L76.0078 8.84757L85.9997 6.65594C97.3802 4.15994 108.629 11.3626 111.125 22.7431L113.317 32.7341L121.932 38.2507C131.745 44.5329 134.606 57.5796 128.324 67.392L122.808 76.0071L125 86C127.496 97.3804 120.294 108.629 108.914 111.126L98.9221 113.317L93.4064 121.932C87.1242 131.745 74.0766 134.607 64.2642 128.324L55.6491 122.809L45.6571 125C34.2766 127.497 23.027 120.295 20.5306 108.914L18.3388 98.9215L9.7236 93.4057C-0.0884267 87.1235 -2.95019 74.0768 3.33177 64.2645L8.84747 55.6494L6.65584 45.6574C4.15963 34.2768 11.3622 23.0269 22.7428 20.5307L32.7347 18.3391L38.2504 9.7239Z"
                        fill="#D9D9D9"
                      />
                      <motion.path
                        d="M38.2504 9.7239C44.5327 -0.0883654 57.5803 -2.95031 67.3926 3.33187L76.0078 8.84757L85.9997 6.65594C97.3802 4.15994 108.629 11.3626 111.125 22.7431L113.317 32.7341L121.932 38.2507C131.745 44.5329 134.606 57.5796 128.324 67.392L122.808 76.0071L125 86C127.496 97.3804 120.294 108.629 108.914 111.126L98.9221 113.317L93.4064 121.932C87.1242 131.745 74.0766 134.607 64.2642 128.324L55.6491 122.809L45.6571 125C34.2766 127.497 23.027 120.295 20.5306 108.914L18.3388 98.9215L9.7236 93.4057C-0.0884267 87.1235 -2.95019 74.0768 3.33177 64.2645L8.84747 55.6494L6.65584 45.6574C4.15963 34.2768 11.3622 23.0269 22.7428 20.5307L32.7347 18.3391L38.2504 9.7239Z"
                        fill={`url(#${gradientId})`}
                        variants={{
                          rest: { opacity: 0 },
                          hover: { opacity: 1 },
                        }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient
                          id={gradientId}
                          x1="51.4973"
                          y1="0.492558"
                          x2="80.1587"
                          y2="131.164"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#267A7D" />
                          <stop offset="1" stop-color="#00B9BF" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </figure>
                </motion.div>
              </motion.li>
            )
          })}
        </ul>
      </section>
    </aside>
  )
}
