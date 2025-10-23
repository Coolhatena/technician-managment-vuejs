import { defineStore } from 'pinia'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isModerator: (state) => state.user?.role === 'moderator',
    userName: (state) => state.user?.name || ''
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.authenticate(username, password)
        
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        // Guardar en localStorage para persistencia
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        return { success: true }
      } catch (error) {
        this.error = error.message
        this.isAuthenticated = false
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null

      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async checkAuth() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        const isValid = await authService.validateToken(token)
        
        if (isValid) {
          this.token = token
          this.user = JSON.parse(userStr)
          this.isAuthenticated = true
        } else {
          this.logout()
        }
      }
    }
  }
})