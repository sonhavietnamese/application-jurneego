import Image from 'next/image'
import Chatbox from '../chat/chatbox'

export default function ZoneChat() {
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

        <div id="chat-zone" className="w-full h-full overflow-y-auto hide-scrollbar pt-20">
          <ul className="w-full text-[#484545] text-base space-y-4 hide-scrollbar">
            {Array.from({ length: 2 }).map((_, index) => (
              <li key={index} className="w-full items-start inline-block overflow-y-auto">
                <div className="grid grid-cols-[auto_1fr] gap-4 w-[80%]">
                  <figure className="w-12 aspect-square">
                    <Image
                      className="w-full h-full object-cover"
                      src="/sample-avatar.png"
                      alt="Sample Avatar"
                      width={40}
                      height={40}
                    />
                  </figure>

                  <div className="leading-tight min-w-[400px] max-w-[600px] w-full overflow-hidden hide-scrollbar">
                    Here&apos;s the updated rate card based on the full Chỗ sitemap. A few important notes: Scope is
                    much larger than a typical restaurant site. With 9 pages, CRM dashboard, booking system, retail
                    catalog, and a multi-branch hub structure, this is closer to a full platform build — hence the
                    $6,800 default (102 hrs × ~$67 blended rate with a small fixed-price risk buffer).
                  </div>
                </div>
              </li>
            ))}

            <li className="w-full flex justify-end">
              <div className="w-[80%] self-end flex justify-end">
                <div className="leading-tight bg-[#F2F2F3] p-4 rounded-2xl px-5 self-end w-fit">
                  Here&apos;s the updated rate card based on the full Chỗ sitemap. A few important notes:
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex">
        <Chatbox />
      </div>
    </div>
  )
}
