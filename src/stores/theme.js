import { defineStore } from 'pinia'

const THEME_MODE_KEY = 'app-theme-mode'
const THEME_ROLE_KEY = 'app-role-theme'

const getInitialMode = () => {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(THEME_MODE_KEY)
  if (stored) return stored

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
  return prefersDark ? 'dark' : 'light'
}

const getInitialRole = () => {
  if (typeof window === 'undefined') return 'default'
  return window.localStorage.getItem(THEME_ROLE_KEY) || 'default'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: getInitialMode(),
    roleAccent: getInitialRole()
  }),

  getters: {
    isDark: (state) => state.mode === 'dark',
    modeClass: (state) => `theme-${state.mode}`,
    roleClass: (state) => `role-${state.roleAccent || 'default'}`
  },

  actions: {
    setMode(mode) {
      const normalized = mode === 'dark' ? 'dark' : 'light'
      this.mode = normalized

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_MODE_KEY, normalized)
      }
    },

    toggleMode() {
      this.setMode(this.mode === 'dark' ? 'light' : 'dark')
    },

    setRole(role) {
      const normalized = role || 'default'
      this.roleAccent = normalized

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_ROLE_KEY, normalized)
      }
    }
  }
})
