import { create } from 'zustand'

export type ConnectionGuidance = {
  id: string
  content: string
}

export type ConnectionNotification = {
  id: string
  title: string
  subtitle: string
}

type ConnectionFeedbackState = {
  guidanceMessages: ConnectionGuidance[]
  notification: ConnectionNotification | null
  addGuidance: (content: string) => void
  showNotification: (notification: Omit<ConnectionNotification, 'id'>) => void
  dismissNotification: () => void
}

function createFeedbackId() {
  return `connection-feedback-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useConnectionFeedbackStore = create<ConnectionFeedbackState>((set) => ({
  guidanceMessages: [],
  notification: null,
  addGuidance: (content) => {
    set((state) => ({
      guidanceMessages: [
        ...state.guidanceMessages,
        {
          id: createFeedbackId(),
          content,
        },
      ],
    }))
  },
  showNotification: (notification) => {
    set({
      notification: {
        id: createFeedbackId(),
        ...notification,
      },
    })
  },
  dismissNotification: () => {
    set({ notification: null })
  },
}))
