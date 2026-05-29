import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CharacterConfig {
  bodyType: string
  skinTone: string
  hairStyle: string
  hairColour: string
  eyeShape: string
  browStyle: string
  lipShape: string
  outfit: string
  accessories: string[]
  expression: string
  displayName: string
  pronouns: string
}

export interface OnboardingState {
  authComplete: boolean
  characterComplete: boolean
  characterStep: number
  groupComplete: boolean
  activeTripId: string | null
  character: CharacterConfig
  userId: string | null
  userEmail: string | null

  setAuth: (email: string, userId: string) => void
  updateCharacterStep: (step: number) => void
  updateCharacter: (updates: Partial<CharacterConfig>) => void
  completeCharacter: () => void
  completeGroup: (tripId: string) => void
  logout: () => void
}

const defaultCharacter: CharacterConfig = {
  bodyType: '',
  skinTone: '',
  hairStyle: '',
  hairColour: '',
  eyeShape: '',
  browStyle: '',
  lipShape: '',
  outfit: '',
  accessories: [],
  expression: '',
  displayName: '',
  pronouns: '',
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      authComplete: false,
      characterComplete: false,
      characterStep: 0,
      groupComplete: false,
      activeTripId: null,
      character: defaultCharacter,
      userId: null,
      userEmail: null,

      setAuth: (email, userId) =>
        set({ authComplete: true, userEmail: email, userId }),

      updateCharacterStep: (step) => set({ characterStep: step }),

      updateCharacter: (updates) =>
        set((s) => ({ character: { ...s.character, ...updates } })),

      completeCharacter: () => set({ characterComplete: true }),

      completeGroup: (tripId) =>
        set({ groupComplete: true, activeTripId: tripId }),

      logout: () =>
        set({
          authComplete: false,
          characterComplete: false,
          characterStep: 0,
          groupComplete: false,
          activeTripId: null,
          character: defaultCharacter,
          userId: null,
          userEmail: null,
        }),
    }),
    { name: 'wanderlog-onboarding' }
  )
)
