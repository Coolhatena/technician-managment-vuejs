<template>
  <section class="dashboard">
    <header class="dashboard-header">
      <div>
        <h2>Panel de Técnicos</h2>
        <p>Accede rápidamente a la gestión de reparaciones.</p>
      </div>
      <router-link class="dashboard-action" to="/jobs">
        Ir a Reparaciones
      </router-link>
    </header>

    <div class="stats-grid">
      <!-- Sección de estadísticas simplificada para el sistema de técnicos -->
      <article class="stat-card">
        <header>
          <h3>Reparaciones</h3>
          <span class="stat-badge">OK</span>
        </header>
        <p class="stat-value">—</p>
        <p class="stat-caption">Resumen disponible próximamente</p>
      </article>
    </div>

    <section class="quick-actions">
      <h3>Acciones rápidas</h3>
      <div class="action-buttons">
        <router-link class="action-button" :to="{ name: 'Home' }">
          Ir al inicio
        </router-link>
        <router-link class="action-button" to="/jobs">
          Reparaciones
        </router-link>
        <button
          v-if="isLogged"
          type="button"
          class="action-button"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { user, signOut } = useAuth()

const isLogged = computed(() => Boolean(user?.value) || authStore.isAuthenticated)

const handleLogout = async () => {
  // Cerrar sesión de Supabase si aplica
  await signOut().catch(() => {})

  // Limpiar estado del store local si se usa ese flujo
  await authStore.logout()
  themeStore.setRole(null)
  await router.replace({ name: 'Login' }).catch(() => {})
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--card-border);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(14, 116, 144, 0.08));
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.dashboard-header h2 {
  margin: 0;
  font-size: 32px;
  color: var(--text-color);
}

.dashboard-header p {
  margin: 8px 0 0;
  color: var(--muted-text);
  max-width: 480px;
}

.dashboard-action {
  align-self: center;
  padding: 12px 20px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, var(--role-accent), var(--role-accent-strong));
  color: var(--accent-contrast);
  font-weight: 700;
  text-decoration: none;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.dashboard-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px var(--accent-shadow);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--card-border);
  background: var(--card-background);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 28px 65px rgba(15, 23, 42, 0.12);
}

.stat-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--muted-text);
  font-weight: 600;
}

.stat-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--role-accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.stat-badge.warning {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}

.stat-value {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  color: var(--text-color);
}

.stat-caption {
  margin: 0;
  color: var(--muted-text);
}

.quick-actions {
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--card-border);
  background: var(--card-background);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 20px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-button {
  padding: 12px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--role-accent), var(--role-accent-strong));
  color: var(--accent-contrast);
  font-weight: 600;
  text-decoration: none;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px var(--accent-shadow);
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
  }

  .dashboard-action {
    align-self: stretch;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-button {
    text-align: center;
  }
}
</style>
