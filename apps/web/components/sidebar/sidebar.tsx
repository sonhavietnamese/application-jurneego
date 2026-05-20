'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

export default function Sidebar() {
  const ulRef = useRef<HTMLUListElement>(null)
  const figureRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const items = [
    { id: 1, title: 'The Perspective Scout' },
    { id: 2, title: 'The Bridge Builder' },
    { id: 3, title: 'The Thoughtful Reflector' },
  ]

  useEffect(() => {
    const ul = ulRef.current
    const figure = figureRef.current
    const svg = svgRef.current
    if (!ul || !figure || !svg) return

    const firstDot = ul.querySelector<HTMLElement>('#dot-0')
    const lastDot = ul.querySelector<HTMLElement>(`#dot-${items.length - 1}`)
    if (!firstDot || !lastDot) return

    const ulRect = ul.getBoundingClientRect()
    const firstRect = firstDot.getBoundingClientRect()
    const lastRect = lastDot.getBoundingClientRect()

    // Center of each dot, relative to the ul's top
    const startY = firstRect.top + firstRect.height / 2 - ulRect.top
    const endY = lastRect.top + lastRect.height / 2 - ulRect.top
    const lineHeight = endY - startY

    // Position the figure so it starts exactly at dot-0's center
    figure.style.top = `${startY}px`

    // Resize the SVG to span dot-0 center → last dot center
    svg.setAttribute('height', String(lineHeight))
    svg.setAttribute('viewBox', `0 0 2.5 ${lineHeight}`)

    const path = svg.querySelector('path')
    if (path) path.setAttribute('d', `M1 0V${lineHeight}`)
  }, [items]) // add items.length as dep if the list is dynamic

  return (
    <aside className="w-[360px] h-full bg-[#FCFCFC] border border-[#EFEFEF] rounded-3xl p-5">
      <figure>
        <Image alt="JurneeGo" src="/jurneego-logo.png" width={100} height={100} />
      </figure>

      <div className="mt-10">
        <h3 className="text-[#92908b] text-base">My Discoveries</h3>
      </div>

      <section>
        <ul ref={ulRef} className="relative list-none p-0 m-0">
          <figure ref={figureRef} className="absolute left-[11px]">
            <svg
              ref={svgRef}
              className="w-full h-full"
              width="2.5"
              height="247"
              viewBox="0 0 2 247"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1V246" stroke="#D9D9D9" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="9 9" />
            </svg>
          </figure>
          {items.map((item, index) => (
            <li key={item.id} className="relative grid grid-cols-[24px_1fr] mb-4 last:mb-0 mt-4">
              <div className="flex items-center justify-center">
                <div
                  id={`dot-${index}`}
                  className={cn(
                    'w-[12px] aspect-square rounded-full z-10 relative',
                    index === 0 ? 'bg-[#D9D9D9]' : 'bg-[#FDFDFD] border-[2.5px] border-[#D9D9D9]'
                  )}
                ></div>
              </div>

              <div className="relative overflow-hidden ml-1 rounded-2xl border border-[#EFEFEF] bg-white p-5 min-h-[110px]">
                <h4 className="font-semibold text-lg mb-6 text-[#747171]">{item.title}</h4>
                <div className="h-2.5 w-2/3 rounded-full bg-gray-200" />

                <figure className="absolute -bottom-10 -right-10 w-28 aspect-square">
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
                      // fill="url(#paint0_linear_2063_12313)"
                      fill="#D9D9D9"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_2063_12313"
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
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
