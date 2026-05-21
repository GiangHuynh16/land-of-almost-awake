import { create } from 'zustand'
import { api } from '../lib/api.js'

export const useAppStore = create((set, get) => ({
  // Auth
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  partner: null,

  // Data
  kingdoms: [],
  achievements: [],
  activeKingdomId: null,

  // Unlock state
  pendingUnlock: null,
  journeyComplete: false,

  // Last seen timestamps for offline catch-up (kingdomId -> ISO string)
  lastSeenUnlocks: JSON.parse(localStorage.getItem('lastSeenUnlocks') || '{}'),

  setAuth(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, kingdoms: [], achievements: [] })
  },

  setPartner(partner) {
    set({ partner })
  },

  async loadKingdoms() {
    const kingdoms = await api.getKingdoms()
    const lastSeen = get().lastSeenUnlocks
    const prevKingdoms = get().kingdoms

    // Detect missed unlocks (offline catch-up) — only if we had previous data
    if (prevKingdoms.length > 0) {
      const missed = kingdoms.filter(
        (k) => k.unlocked_at && k.status !== 'locked' && !lastSeen[k.id]
      )
      if (missed.length > 0) {
        const latest = missed[missed.length - 1]
        set({ pendingUnlock: { kingdom: latest, catchUp: true } })
      }
    }

    set({ kingdoms })
    return kingdoms
  },

  async loadAchievements(kingdomId) {
    const achievements = await api.getAchievements(kingdomId)
    set({ achievements, activeKingdomId: kingdomId })
    return achievements
  },

  addAchievement(achievement) {
    set((s) => {
      if (s.achievements.some((a) => a.id === achievement.id)) return s
      return { achievements: [achievement, ...s.achievements] }
    })
  },

  updateAchievement(updated) {
    set((s) => ({
      achievements: s.achievements.map((a) => (a.id === updated.id ? updated : a)),
    }))
  },

  removeAchievement(id) {
    set((s) => ({ achievements: s.achievements.filter((a) => a.id !== id) }))
  },

  triggerUnlock(kingdom, journeyComplete = false) {
    if (journeyComplete) {
      set({ journeyComplete: true })
    } else {
      set({ pendingUnlock: { kingdom } })
    }
  },

  clearUnlock() {
    const { pendingUnlock, lastSeenUnlocks } = get()
    if (pendingUnlock?.kingdom) {
      const updated = { ...lastSeenUnlocks, [pendingUnlock.kingdom.id]: new Date().toISOString() }
      localStorage.setItem('lastSeenUnlocks', JSON.stringify(updated))
      set({ lastSeenUnlocks: updated })
    }
    set({ pendingUnlock: null })
    get().loadKingdoms()
  },

  clearJourneyComplete() {
    set({ journeyComplete: false })
  },
}))
