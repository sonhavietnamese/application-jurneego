import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { UIMessage } from 'ai'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMessageText(message: UIMessage) {
  return message.parts.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join('')
}
