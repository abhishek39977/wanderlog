import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, addDays } from 'date-fns'

export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface TripMember {
  id: string
  name: string
  email: string
  role: MemberRole
  joinedAt: string
  characterConfig?: Record<string, unknown>
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  coverPhoto: string
  tripType: string
  joinCode: string
  privacy: 'public' | 'private' | 'archived'
  members: TripMember[]
  ownerId: string
  budget?: number
  currency: string
  createdAt: string
}

export interface PackingItem {
  id: string
  name: string
  category: string
  packed: boolean
  assignedTo?: string
}

export interface WishlistItem {
  id: string
  title: string
  category: string
  imageUrl?: string
  url?: string
  priority: boolean
  completed: boolean
}

export interface ExpenseItem {
  id: string
  amount: number
  category: string
  payer: string
  payerName: string
  date: string
  description: string
  splitType: 'equal' | 'custom'
  splits: Record<string, number>
  settled: boolean
}

export interface TimelineEvent {
  id: string
  dayIndex: number
  time: string
  title: string
  description: string
  location: string
  type: string
}

export interface DayChapter {
  id: string
  date: string
  title: string
  mood: string
  moodRating: number
  notes: string
  events: TimelineEvent[]
  photos: string[]
}

export interface PlacePin {
  id: string
  name: string
  lat: number
  lng: number
  category: string
  rating: number
  notes: string
  photos: string[]
}

export interface GalleryPhoto {
  id: string
  url: string
  dayIndex: number
  caption: string
  revealed: boolean
  takenAt: string
}

export interface TickChallenge {
  id: string
  title: string
  difficulty: string
  completed: boolean
  completedBy?: string
  proofPhoto?: string
}

export interface Reminder {
  id: string
  title: string
  date: string
  time: string
  category: string
  repeat: string
}

export interface Settlement {
  fromId: string
  fromName: string
  toId: string
  toName: string
  amount: number
}

export interface TripStore {
  trips: Trip[]
  activeTrip: Trip | null
  packingItems: PackingItem[]
  wishlistItems: WishlistItem[]
  expenses: ExpenseItem[]
  dayChapters: DayChapter[]
  places: PlacePin[]
  gallery: GalleryPhoto[]
  challenges: TickChallenge[]
  reminders: Reminder[]
  myRole: MemberRole
  settledPairs: Set<string>

  setActiveTrip: (trip: Trip) => void
  createTrip: (tripData: Omit<Trip, 'id' | 'joinCode' | 'createdAt' | 'members'>, ownerId: string, ownerName: string) => Trip
  joinTrip: (code: string, userId: string, userName: string) => Trip | null
  addPackingItem: (item: Omit<PackingItem, 'id'>) => void
  togglePackingItem: (id: string) => void
  removePackingItem: (id: string) => void
  addWishlistItem: (item: Omit<WishlistItem, 'id'>) => void
  toggleWishlistItem: (id: string) => void
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void
  removeExpense: (id: string) => void
  updateDayChapter: (chapter: DayChapter) => void
  addPlace: (place: Omit<PlacePin, 'id'>) => void
  removePlace: (id: string) => void
  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id'>) => void
  revealPhoto: (id: string) => void
  toggleChallenge: (id: string, userId: string) => void
  addChallenge: (challenge: Omit<TickChallenge, 'id'>) => void
  removeChallenge: (id: string) => void
  addReminder: (reminder: Omit<Reminder, 'id'>) => void
  updateTripSettings: (updates: Partial<Trip>) => void
  updateMemberRole: (memberId: string, role: MemberRole) => void
  removeMember: (memberId: string) => void
  getBalance: () => Record<string, number>
  getSettlements: () => Settlement[]
  markSettled: (fromId: string, toId: string) => void
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function generateJoinCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

function generateDayChapters(startDate: string, endDate: string): DayChapter[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const chapters: DayChapter[] = []
  let current = start
  let idx = 0
  while (current <= end) {
    chapters.push({
      id: generateId(),
      date: format(current, 'yyyy-MM-dd'),
      title: `Day ${idx + 1}`,
      mood: '',
      moodRating: 0,
      notes: '',
      events: [],
      photos: [],
    })
    current = addDays(current, 1)
    idx++
  }
  return chapters
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTrip: null,
      packingItems: [],
      wishlistItems: [],
      expenses: [],
      dayChapters: [],
      places: [],
      gallery: [],
      challenges: [],
      reminders: [],
      myRole: 'owner',
      settledPairs: new Set<string>(),

      setActiveTrip: (trip) => set({ activeTrip: trip }),

      createTrip: (tripData, ownerId, ownerName) => {
        const trip: Trip = {
          ...tripData,
          id: generateId(),
          joinCode: generateJoinCode(),
          createdAt: new Date().toISOString(),
          members: [{ id: ownerId, name: ownerName, email: '', role: 'owner', joinedAt: new Date().toISOString() }],
        }
        const dayChapters = generateDayChapters(trip.startDate, trip.endDate)
        set((s) => ({
          trips: [...s.trips, trip],
          activeTrip: trip,
          dayChapters,
          myRole: 'owner',
          packingItems: [],
          wishlistItems: [],
          expenses: [],
          places: [],
          gallery: [],
          challenges: [],
          settledPairs: new Set<string>(),
        }))
        return trip
      },

      joinTrip: (code, userId, userName) => {
        const { trips } = get()
        const trip = trips.find(t => t.joinCode === code.toUpperCase())
        if (!trip) return null
        const updatedTrip = {
          ...trip,
          members: [...trip.members, { id: userId, name: userName, email: '', role: 'editor' as MemberRole, joinedAt: new Date().toISOString() }],
        }
        const dayChapters = generateDayChapters(trip.startDate, trip.endDate)
        set((s) => ({
          trips: s.trips.map(t => t.id === trip.id ? updatedTrip : t),
          activeTrip: updatedTrip,
          dayChapters,
          myRole: 'editor',
        }))
        return updatedTrip
      },

      addPackingItem: (item) => set((s) => ({ packingItems: [...s.packingItems, { ...item, id: generateId() }] })),
      togglePackingItem: (id) => set((s) => ({ packingItems: s.packingItems.map(i => i.id === id ? { ...i, packed: !i.packed } : i) })),
      removePackingItem: (id) => set((s) => ({ packingItems: s.packingItems.filter(i => i.id !== id) })),

      addWishlistItem: (item) => set((s) => ({ wishlistItems: [...s.wishlistItems, { ...item, id: generateId() }] })),
      toggleWishlistItem: (id) => set((s) => ({ wishlistItems: s.wishlistItems.map(i => i.id === id ? { ...i, completed: !i.completed } : i) })),

      addExpense: (expense) => set((s) => ({ expenses: [...s.expenses, { ...expense, id: generateId() }] })),
      removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter(e => e.id !== id) })),

      updateDayChapter: (chapter) => set((s) => ({ dayChapters: s.dayChapters.map(d => d.id === chapter.id ? chapter : d) })),

      addPlace: (place) => set((s) => ({ places: [...s.places, { ...place, id: generateId() }] })),
      removePlace: (id) => set((s) => ({ places: s.places.filter(p => p.id !== id) })),

      addGalleryPhoto: (photo) => set((s) => ({ gallery: [...s.gallery, { ...photo, id: generateId() }] })),
      revealPhoto: (id) => set((s) => ({ gallery: s.gallery.map(p => p.id === id ? { ...p, revealed: true } : p) })),

      toggleChallenge: (id, userId) => set((s) => ({
        challenges: s.challenges.map(c => c.id === id ? { ...c, completed: !c.completed, completedBy: !c.completed ? userId : undefined } : c),
      })),

      addChallenge: (challenge) => set((s) => ({ challenges: [...s.challenges, { ...challenge, id: generateId() }] })),
      removeChallenge: (id) => set((s) => ({ challenges: s.challenges.filter(c => c.id !== id) })),

      addReminder: (reminder) => set((s) => ({ reminders: [...s.reminders, { ...reminder, id: generateId() }] })),

      updateTripSettings: (updates) => set((s) => {
        if (!s.activeTrip) return s
        const updated = { ...s.activeTrip, ...updates }
        return {
          activeTrip: updated,
          trips: s.trips.map(t => t.id === updated.id ? updated : t),
          ...(updates.startDate || updates.endDate ? { dayChapters: generateDayChapters(updated.startDate, updated.endDate) } : {}),
        }
      }),

      updateMemberRole: (memberId, role) => set((s) => {
        if (!s.activeTrip) return s
        const updated = { ...s.activeTrip, members: s.activeTrip.members.map(m => m.id === memberId ? { ...m, role } : m) }
        return { activeTrip: updated, trips: s.trips.map(t => t.id === updated.id ? updated : t) }
      }),

      removeMember: (memberId) => set((s) => {
        if (!s.activeTrip) return s
        const updated = { ...s.activeTrip, members: s.activeTrip.members.filter(m => m.id !== memberId) }
        return { activeTrip: updated, trips: s.trips.map(t => t.id === updated.id ? updated : t) }
      }),

      getBalance: () => {
        const { expenses, activeTrip } = get()
        if (!activeTrip) return {}
        const balance: Record<string, number> = {}
        activeTrip.members.forEach(m => { balance[m.id] = 0 })
        expenses.forEach(exp => {
          const memberCount = activeTrip.members.length
          const share = exp.amount / memberCount
          balance[exp.payer] = (balance[exp.payer] || 0) + exp.amount - share
          activeTrip.members.forEach(m => {
            if (m.id !== exp.payer) {
              balance[m.id] = (balance[m.id] || 0) - share
            }
          })
        })
        return balance
      },

      getSettlements: () => {
        const { activeTrip, settledPairs } = get()
        if (!activeTrip) return []
        const balance = get().getBalance()
        // Build directed debt pairs using the "minimize transactions" algorithm
        const debtors = activeTrip.members
          .filter(m => (balance[m.id] || 0) < -0.01)
          .map(m => ({ ...m, amount: Math.abs(balance[m.id]) }))
          .sort((a, b) => b.amount - a.amount)
        const creditors = activeTrip.members
          .filter(m => (balance[m.id] || 0) > 0.01)
          .map(m => ({ ...m, amount: balance[m.id] }))
          .sort((a, b) => b.amount - a.amount)

        const settlements: Settlement[] = []
        const dCopy = debtors.map(d => ({ ...d }))
        const cCopy = creditors.map(c => ({ ...c }))

        let di = 0, ci = 0
        while (di < dCopy.length && ci < cCopy.length) {
          const d = dCopy[di]
          const c = cCopy[ci]
          const pairKey = `${d.id}-${c.id}`
          if (!settledPairs.has(pairKey)) {
            const amount = Math.min(d.amount, c.amount)
            if (amount > 0.01) {
              settlements.push({
                fromId: d.id, fromName: d.name,
                toId: c.id, toName: c.name,
                amount: Math.round(amount * 100) / 100,
              })
            }
          }
          const transfer = Math.min(d.amount, c.amount)
          d.amount -= transfer
          c.amount -= transfer
          if (d.amount < 0.01) di++
          if (c.amount < 0.01) ci++
        }
        return settlements
      },

      markSettled: (fromId, toId) => set(s => {
        const newSet = new Set(s.settledPairs)
        newSet.add(`${fromId}-${toId}`)
        return { settledPairs: newSet }
      }),
    }),
    {
      name: 'wanderlog-trip',
      partialize: (s) => ({
        ...s,
        settledPairs: Array.from(s.settledPairs),
      }),
      merge: (persisted: unknown, current) => {
        const p = persisted as Record<string, unknown>
        return {
          ...current,
          ...(p as object),
          settledPairs: new Set<string>(Array.isArray(p?.settledPairs) ? p.settledPairs as string[] : []),
        }
      },
    }
  )
)
