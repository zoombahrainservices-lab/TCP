import { create } from 'zustand'
import type { CelebrationPayload } from './types'

interface CelebrationStore {
  queue: CelebrationPayload[]
  current: CelebrationPayload | null
  open: boolean
  enqueue: (payload: CelebrationPayload) => void
  closeCurrent: () => void
  dequeueAndOpen: () => void
}

export const useCelebrationStore = create<CelebrationStore>((set, get) => ({
  queue: [],
  current: null,
  open: false,

  enqueue: (payload: CelebrationPayload) => {
    set((state) => {
      const newQueue = [...state.queue, payload]
      
      // If nothing is currently showing, immediately show the new payload
      if (!state.open && !state.current) {
        return {
          queue: newQueue.slice(1),
          current: payload,
          open: true
        }
      }
      
      // Otherwise, add to queue (max 4 total items – section, chapter, streak, level-up can all fire together)
      return {
        queue: newQueue.slice(0, 4)
      }
    })
  },

  closeCurrent: () => {
    set({ open: false })
    
    // After a small delay, dequeue the next celebration
    setTimeout(() => {
      get().dequeueAndOpen()
    }, 300)
  },

  dequeueAndOpen: () => {
    set((state) => {
      if (state.queue.length === 0) {
        return {
          current: null,
          open: false
        }
      }
      
      const [next, ...rest] = state.queue
      return {
        queue: rest,
        current: next,
        open: true
      }
    })
  }
}))
