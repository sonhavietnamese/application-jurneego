import { useEffect, useRef } from 'react'

type ChatboxProps = {
  input: string
  isSending: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onStop: () => void
}

export default function Chatbox({ input, isSending, onInputChange, onSend, onStop }: ChatboxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textareaElement = textareaRef.current

    if (!textareaElement) {
      return
    }

    if (isSending) {
      textareaElement.blur()
      return
    }

    textareaElement.focus()
  }, [isSending])

  useEffect(() => {
    const textareaElement = textareaRef.current

    if (!textareaElement) {
      return
    }

    textareaElement.style.height = '0px'
    textareaElement.style.height = `${Math.min(textareaElement.scrollHeight, 300)}px`
  }, [input])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSend()
      }}
      className="w-full bg-[#FDFDFD] rounded-4xl border border-[#EFEFEF] p-5 font-sans z-50"
    >
      <textarea
        ref={textareaRef}
        value={input}
        disabled={isSending}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
            return
          }

          event.preventDefault()
          onSend()
        }}
        placeholder="What do you think?"
        rows={1}
        className="max-h-[300px] min-h-8 w-full resize-none overflow-y-auto outline-none text-lg leading-snug text-[#706E69] disabled:opacity-60 hide-scrollbar"
      />
      <div className="mt-5 flex items-center justify-between">
        <button type="button" className="p-3 bg-[#FDFDFD] rounded-2xl border border-[#EFEFEF]">
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

        <div className="flex gap-2 items-center justify-center">
          <button
            type={isSending ? 'button' : 'submit'}
            onClick={isSending ? onStop : undefined}
            disabled={!isSending && input.trim().length === 0}
            className="p-3 bg-[#005659] rounded-2xl border border-[#EFEFEF] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isSending ? 'Stop response' : 'Send message'}
          >
            <figure className="w-5 aspect-square">
              {isSending ? (
                <svg
                  className="w-full h-full"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="5" y="5" width="10" height="10" rx="2" fill="white" />
                </svg>
              ) : (
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
              )}
            </figure>
          </button>
        </div>
      </div>
    </form>
  )
}
