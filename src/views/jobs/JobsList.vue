<script setup>
import { onMounted } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import { useRouter } from 'vue-router'

const store = useJobsStore()
const router = useRouter()

onMounted(() => store.fetchAll())

function go(job) { router.push(`/jobs/${job.id}`) }
function statusClass(s) { return `status status--${s}` }
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1>Reparaciones</h1>
      <router-link to="/jobs/new" class="btn btn-primary">Nueva</router-link>
    </header>

    <div v-if="store.loading" class="loading">Cargando…</div>
    <div v-else class="card">
      <table class="jobs-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Cliente</th>
            <th>Equipo</th>
            <th>Estado</th>
            <th>Actualizado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in store.items" :key="j.id" @click="go(j)">
            <td class="title">{{ j.title }}</td>
            <td>{{ j.customer_name }}</td>
            <td>{{ j.device_type }}</td>
            <td><span :class="statusClass(j.status)">{{ j.status }}</span></td>
            <td class="muted">{{ new Date(j.updated_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </template>

<style scoped>
.page { max-width: 1000px; margin: 0 auto; padding: 20px }
.page-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-bottom: 16px;
}
.card {
  background: var(--card-background); border: 1px solid var(--card-border);
  border-radius: 14px; padding: 8px; box-shadow: 0 12px 28px rgba(15,23,42,0.08);
}
.btn { padding: 8px 14px; border-radius: 999px; text-decoration: none; font-weight: 600; cursor: pointer; }
.btn-primary { color: var(--accent-contrast); background: linear-gradient(135deg,var(--role-accent),var(--role-accent-strong)); border: none; }
.btn-primary:hover { filter: brightness(1.05) }
.loading { color: var(--muted-text); padding: 12px }

.jobs-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.jobs-table thead th {
  text-align: left; font-weight: 700; padding: 12px; color: var(--muted-text);
  border-bottom: 1px solid var(--divider-color);
}
.jobs-table tbody td { padding: 14px 12px; border-bottom: 1px solid rgba(148,163,184,.2) }
.jobs-table tbody tr { cursor: pointer; transition: background .2s ease }
.jobs-table tbody tr:hover { background: var(--accent-soft) }
.jobs-table .title { font-weight: 600 }
.muted { color: var(--muted-text) }

.status { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase }
.status--received { background: #e0e7ff; color: #3730a3 }
.status--in_progress { background: #d1fae5; color: #065f46 }
.status--waiting_parts { background: #fef9c3; color: #854d0e }
.status--repaired { background: #dcfce7; color: #166534 }
.status--delivered { background: #e5e7eb; color: #374151 }
.status--canceled { background: #fee2e2; color: #991b1b }
</style>
