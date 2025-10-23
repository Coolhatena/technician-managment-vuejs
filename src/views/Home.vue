<template>
  <div class="home">
    <h1>Sistema de Técnicos</h1>
    <p v-if="authStore.isAuthenticated" class="welcome-message">
      Hola, {{ authStore.userName }}
    </p>
    <p v-else>Inicia sesión para gestionar reparaciones</p>

    <nav class="home-nav">
      <router-link v-if="authStore.isAuthenticated" to="/jobs">Reparaciones</router-link>
      <router-link v-if="!authStore.isAuthenticated" :to="{ name: 'Login' }">Login</router-link>
      <router-link v-if="authStore.isAuthenticated" :to="{ name: 'Dashboard' }">Panel</router-link>
      <button v-if="authStore.isAuthenticated" @click="handleLogout">Logout</button>
    </nav>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  themeStore.setRole(null)
  await router
    .replace({ name: 'Login' })
    .catch(() => {})
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-message {
  color: var(--muted-text);
}

.home-nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.home-nav a,
.home-nav button {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: var(--card-background);
  color: var(--text-color);
  text-decoration: none;
  font-weight: 600;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  cursor: pointer;
}

.home-nav a:hover,
.home-nav button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px var(--accent-shadow);
}
</style>
