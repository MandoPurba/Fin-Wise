import { create } from 'zustand'
import { Profile } from '@/types'

interface AppState {
  user: Profile | null
  selectedAccount: string | null
  dateRange: {
    from: Date
    to: Date
  }
  setUser: (user: Profile | null) => void
  setSelectedAccount: (accountId: string | null) => void
  setDateRange: (range: { from: Date; to: Date }) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  selectedAccount: null,
  dateRange: {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
    to: new Date(), // Today
  },
  setUser: (user) => set({ user }),
  setSelectedAccount: (accountId) => set({ selectedAccount: accountId }),
  setDateRange: (range) => set({ dateRange: range }),
}))
