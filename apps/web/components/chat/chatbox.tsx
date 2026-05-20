export default function Chatbox() {
  return (
    <section className="w-full bg-[#FDFDFD] rounded-3xl border border-[#EFEFEF] p-5 font-sans">
      <input type="text" placeholder="What do you think?" className="outline-none w-full text-lg text-[#706E69]" />
      <div className="mt-5 flex items-center justify-between">
        <button className="p-3 bg-[#FDFDFD] rounded-2xl border border-[#EFEFEF]">
          <figure className="w-5 aspect-square">
            <svg
              className="w-full h-full"
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.4988 1V20" stroke="#646462" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 10.4988L1 10.4988" stroke="#646462" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </figure>
        </button>

        <button className="p-3 bg-[#005659] rounded-2xl border border-[#EFEFEF]">
          <figure className="w-5 aspect-square">
            <svg
              className="w-full h-full"
              width="18"
              height="24"
              viewBox="0 0 18 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.77669 2.17822V22.1782M1.5 9.58563L8.77669 2.17822L15.5741 9.58563"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </figure>
        </button>
      </div>
    </section>
  )
}
