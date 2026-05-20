import Image from 'next/image'

export default function Notification() {
  return (
    <aside className="absolute bottom-5 right-5">
      <div className="w-[400px] bg-[#FDFDFD] rounded-3xl border border-[#EFEFEF] p-5 overflow-hidden relative">
        <div className="text-lg flex flex-col">
          <span className="text-[#2F2F2F] text-xl font-semibold ">Awesome!</span>
          <span className="text-[#8A8884] text-sm">The connection very creative</span>
          <div className="bg-[#FFD478] rounded-xl p-2 py-1.5 text-sm text-[#7E5F1E] font-semibold w-fit mt-2 select-none">
            +25%
          </div>
        </div>

        <>
          <figure className="w-[150px] aspect-square absolute -bottom-2 -right-2 z-20">
            <Image
              className="w-full h-full object-cover"
              src="/sample-people.png"
              alt="Sample People"
              width={50}
              height={50}
            />
          </figure>

          <figure className="absolute -bottom-12 -right-5 w-[154px] z-10">
            <svg
              className="w-full h-full"
              width="184"
              height="184"
              viewBox="0 0 184 184"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M87 5.16055C100.361 -4.01739 118.633 -0.626179 127.811 12.735L135.869 24.4659L149.862 27.0631C165.8 30.0212 176.321 45.3384 173.363 61.2757L170.766 75.2691L178.824 87C188.002 100.361 184.611 118.633 171.25 127.811L159.519 135.869L156.922 149.862C153.964 165.8 138.646 176.321 122.709 173.363L108.716 170.766L96.9849 178.824C83.6237 188.002 65.352 184.611 56.174 171.25L48.1159 159.519L34.1225 156.922C18.1853 153.964 7.66379 138.647 10.6215 122.709L13.2186 108.716L5.16053 96.9849C-4.01742 83.6237 -0.626207 65.352 12.735 56.1741L24.4659 48.116L27.063 34.1225C30.0212 18.1852 45.3392 7.6637 61.2766 10.6217L75.2691 13.2187L87 5.16055Z"
                fill="#FFD478"
              />
            </svg>
          </figure>

          <figure className="absolute -bottom-12 -right-5 w-[180px] rotate-4">
            <svg
              className="w-full h-full"
              width="184"
              height="184"
              viewBox="0 0 184 184"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M87 5.16055C100.361 -4.01739 118.633 -0.626179 127.811 12.735L135.869 24.4659L149.862 27.0631C165.8 30.0212 176.321 45.3384 173.363 61.2757L170.766 75.2691L178.824 87C188.002 100.361 184.611 118.633 171.25 127.811L159.519 135.869L156.922 149.862C153.964 165.8 138.646 176.321 122.709 173.363L108.716 170.766L96.9849 178.824C83.6237 188.002 65.352 184.611 56.174 171.25L48.1159 159.519L34.1225 156.922C18.1853 153.964 7.66379 138.647 10.6215 122.709L13.2186 108.716L5.16053 96.9849C-4.01742 83.6237 -0.626207 65.352 12.735 56.1741L24.4659 48.116L27.063 34.1225C30.0212 18.1852 45.3392 7.6637 61.2766 10.6217L75.2691 13.2187L87 5.16055Z"
                fill="#0A6B6F"
              />
            </svg>
          </figure>
        </>
      </div>
    </aside>
  )
}
