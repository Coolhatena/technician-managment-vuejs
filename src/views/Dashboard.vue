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
      <article class="stat-card">
        <header>
          <h3>Total de jobs</h3>
        </header>
        <p class="stat-value">{{ totalJobs }}</p>
        <p class="stat-caption">Todos tus trabajos</p>
      </article>
      <article class="stat-card">
        <header>
          <h3>Terminados (reparados)</h3>
        </header>
        <p class="stat-value">{{ repairedJobs }}</p>
        <p class="stat-caption">Con estado "repaired"</p>
      </article>
      <article class="stat-card">
        <header>
          <h3>Entregados</h3>
        </header>
        <p class="stat-value">{{ deliveredJobs }}</p>
        <p class="stat-caption">Con estado "delivered"</p>
      </article>
      <article class="stat-card">
        <header>
          <h3>En progreso</h3>
        </header>
        <p class="stat-value">{{ inProgressJobs }}</p>
        <p class="stat-caption">En curso o esperando partes</p>
      </article>
    </div>

    <section class="upcoming">
      <h3>Entregas próximas (7 días)</h3>
      <div class="card-list" v-if="upcomingDeliveries.length > 0">
        <router-link
          v-for="j in upcomingDeliveries"
          :key="j.id"
          class="card-list-item"
          :to="`/jobs/${j.id}`"
        >
          <div class="item-main">
            <div class="item-title">{{ j.title }}</div>
            <div class="item-sub">{{ j.customer_name }} — {{ j.device_type }}</div>
          </div>
          <div class="item-meta">
            <span class="pill">{{ formatDateTime(j.delivery_at) }}</span>
            <span class="status">{{ store.statusLabel(j.status) }}</span>
          </div>
        </router-link>
      </div>
      <p v-else class="muted">No hay entregas próximas.</p>
    </section>

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
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/composables/useAuth'
import { useJobsStore } from '@/stores/jobs'
import { formatDateTime, parseDateTime } from '@/utils/date'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { user, signOut } = useAuth()
const store = useJobsStore()

const isLogged = computed(() => Boolean(user?.value) || authStore.isAuthenticated)

onMounted(() => { store.fetchAll() })

const totalJobs = computed(() => (store.items || []).length)

const repairedJobs = computed(() => {
  return (store.items || []).reduce((acc, j) => acc + (store.statusCode(j.status) === 'repaired' ? 1 : 0), 0)
})

const deliveredJobs = computed(() => {
  return (store.items || []).reduce((acc, j) => acc + (store.statusCode(j.status) === 'delivered' ? 1 : 0), 0)
})

const inProgressJobs = computed(() => {
  const active = new Set(['in_progress','waiting_parts'])
  return (store.items || []).reduce((acc, j) => acc + (active.has(store.statusCode(j.status)) ? 1 : 0), 0)
})

const upcomingDeliveries = computed(() => {
  // Considerar de hoy (00:00) hasta dentro de 7 días (23:59)
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
  end.setHours(23, 59, 59, 999)
  const exclude = new Set(['delivered','canceled'])
  return (store.items || [])
    .filter(j => j.delivery_at)
    .filter(j => {
      const d = parseDateTime(j.delivery_at)
      if (!d) return false
      const code = store.statusCode(j.status)
      return d >= start && d <= end && !exclude.has(code)
    })
    .sort((a, b) => {
      const da = parseDateTime(a.delivery_at)
      const db = parseDateTime(b.delivery_at)
      return (da?.getTime() || 0) - (db?.getTime() || 0)
    })
})

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

.upcoming {
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--card-border);
  background: var(--card-background);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.card-list { display: flex; flex-direction: column; gap: 10px }
.card-list-item {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 12px 14px; border: 1px solid var(--card-border); border-radius: 12px;
  color: var(--text-color); text-decoration: none; background: var(--card-background);
}
.card-list-item:hover { background: var(--accent-soft) }
.item-title { font-weight: 700 }
.item-sub { color: var(--muted-text); font-size: 14px }
.item-meta { display: flex; align-items: center; gap: 10px }
.pill { padding: 4px 10px; border-radius: 999px; background: var(--accent-soft); font-weight: 700; font-size: 12px }
.status { color: var(--muted-text); font-size: 12px }

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
