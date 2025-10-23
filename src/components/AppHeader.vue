<template>
  <header class="app-header">
    <div class="header-content">
      <h1>Mi Aplicación</h1>
      <div class="header-actions">
        <router-link v-if="authStore.isAuthenticated" to="/jobs" class="nav-link">Reparaciones</router-link>
        <button class="theme-toggle" type="button" @click="toggleTheme">
          {{ themeButtonLabel }}
        </button>
        <div v-if="authStore.isAuthenticated" class="user-info">
          <span class="user-name">{{ authStore.userName }}</span>
          <span class="user-role">
            {{ roleLabel }}
          </span>
          <button @click="handleLogout" class="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const roleLabel = computed(() => {
  const roles = {
    admin: 'Administrador',
    user: 'Usuario',
    moderator: 'Moderador'
  }
  return roles[authStore.userRole] || authStore.userRole || 'Invitado'
})

const themeButtonLabel = computed(() =>
  themeStore.isDark ? 'Modo claro' : 'Modo oscuro'
)

const handleLogout = async () => {
  await authStore.logout()
  themeStore.setRole(null)
  await router
    .replace({ name: 'Login' })
    .catch(() => {})
}

const toggleTheme = () => {
  themeStore.toggleMode()
}
</script>

<style scoped>
.app-header {
  background: var(--header-background);
  box-shadow: var(--header-shadow);
  padding: 16px 24px;
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 24px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  border: 1px solid var(--card-border);
  background: var(--card-background);
  color: var(--text-color);
  border-radius: 999px;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: 600;
}

.theme-toggle {
  border: 1px solid var(--card-border);
  background: var(--card-background);
  color: var(--text-color);
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.theme-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px var(--accent-shadow);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: var(--accent-soft);
  border-radius: 999px;
  border: 1px solid var(--card-border);
}

.user-name {
  font-weight: 600;
  color: var(--text-color);
}

.user-role {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-contrast);
  background: linear-gradient(135deg, var(--role-accent), var(--role-accent-strong));
}

.logout-button {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--role-accent), var(--role-accent-strong));
  color: var(--accent-contrast);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.logout-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px var(--accent-shadow);
}

@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
  }

  .logout-button,
  .theme-toggle {
    width: 100%;
    text-align: center;
  }
}
</style>
