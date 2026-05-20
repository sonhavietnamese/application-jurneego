type DrawModeButtonProps = {
  isDrawingMode: boolean
  onClick: () => void
}

export function DrawModeButton({ isDrawingMode, onClick }: DrawModeButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isDrawingMode}
      aria-label={isDrawingMode ? 'Stop drawing lines' : 'Draw lines'}
      title={isDrawingMode ? 'Stop drawing lines' : 'Draw lines'}
      onClick={onClick}
      className={`p-2 mr-5 pl-[11px] pr-[4.5px] rounded-2xl border transition ${
        isDrawingMode ? 'bg-[#e7f5f2] border-[#85bbb5] shadow-sm' : 'bg-[#FDFDFD] border-[#EFEFEF]'
      }`}
    >
      <figure className="aspect-square">
        <svg
          className="w-full h-full"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="mask0_2053_124"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="2"
            y="3"
            width="22"
            height="24"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.44325 3.66449H23.4281V26.7978H2.44325V3.66449Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask0_2053_124)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.0137 6.12767L4.51391 20.51C4.30504 20.7714 4.22809 21.1085 4.30504 21.4322L5.13684 24.956L8.84876 24.9096C9.20175 24.9059 9.52787 24.7484 9.74407 24.4796C13.6734 19.5634 21.1644 10.1901 21.377 9.91532C21.5773 9.59042 21.6554 9.13117 21.5504 8.68901C21.4429 8.23586 21.1608 7.85111 20.754 7.6056C20.6673 7.54575 18.6092 5.94812 18.5457 5.89805C17.7713 5.27756 16.6415 5.38505 16.0137 6.12767V6.12767ZM4.41375 26.7979C3.98992 26.7979 3.62104 26.5072 3.52211 26.0931L2.52176 21.8536C2.31534 20.9754 2.52054 20.0691 3.08362 19.3655L14.5895 4.97465C14.5944 4.96976 14.598 4.96365 14.6029 4.95877C15.8646 3.4503 18.1463 3.228 19.6853 4.46287C19.7463 4.5105 21.7898 6.09836 21.7898 6.09836C22.5324 6.54052 23.1126 7.33078 23.3325 8.2664C23.5511 9.19224 23.3923 10.1474 22.883 10.9548C22.8451 11.0146 22.8121 11.0659 11.1744 25.6253C10.6137 26.324 9.77338 26.7307 8.87074 26.7417L4.42597 26.7979H4.41375Z"
              fill="black"
            />
          </g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.8157 14.2721C19.6203 14.2721 19.4249 14.2098 19.2575 14.0828L12.5983 8.96748C12.1977 8.65968 12.1219 8.08561 12.4297 7.68253C12.7388 7.28191 13.3128 7.2074 13.7147 7.5152L20.3751 12.6293C20.7758 12.9371 20.8515 13.5124 20.5425 13.9143C20.3629 14.1488 20.0905 14.2721 19.8157 14.2721"
            fill="black"
          />
        </svg>
      </figure>
    </button>
  )
}
