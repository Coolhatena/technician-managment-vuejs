<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicTracking, respondExtra } from '@/api/jobsApi'
import { formatDate, formatDateTime } from '@/utils/date'
import { useSwal } from '@/composables/useSwal'

const route = useRoute()
const token = route.params.token
const job = ref(null)
const logs = ref([])
const { swal } = useSwal()

onMounted(async () => {
  const { data, error } = await getPublicTracking(token)
  if (error) { job.value = { title: 'No disponible' }; return }
  if (!data || data.length === 0) { job.value = { title: 'No encontrado' }; return }

  // agrupa cabecera + logs
  const head = data[0]
  job.value = {
    id: head.job_id,
    title: head.title,
    device_type: head.device_type,
    brand: head.brand,
    model: head.model,
    serial: head.serial,
    status: head.status,
    intake_date: head.intake_date,
    delivery_at: head.delivery_at
  }
  logs.value = data
    .filter(r => r.log_id)
    .map(r => ({
      id: r.log_id,
      message: r.log_message,
      status: r.log_status,
      attachment_url: r.log_attachment_url,
      created_at: r.log_created_at,
      response: r.log_response_decision ? { decision: r.log_response_decision, created_at: r.log_response_created_at } : null
    }))
})

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
}

function linkify(text) {
  if (!text) return ''
  const re = /(https?:\/\/[^\s]+)/g
  let html = ''
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    const url = m[0]
    const idx = m.index
    html += escapeHtml(text.slice(last, idx))
    const safeUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    html += `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`
    last = idx + url.length
  }
  html += escapeHtml(text.slice(last))
  return html
}

async function handleDecision(log, decision) {
  // decision: 'approved' | 'rejected'
  const { data, error } = await respondExtra(token, log.id, decision)
  if (error) {
    console.error('respond_extra error:', error)
    const msg = error?.message || ''
    // Muestra mensaje más útil si la función no existe o permisos
    if (/function.*respond_extra.*does not exist/i.test(msg) || /procedure.*respond_extra.*does not exist/i.test(msg)) {
      swal?.fire({ icon: 'error', title: 'No se pudo enviar tu respuesta', text: 'Función respond_extra no existe en la base. Aplique las migraciones en Supabase.' })
    } else if (/permission denied|execute privilege/i.test(msg)) {
      swal?.fire({ icon: 'error', title: 'No se pudo enviar tu respuesta', text: 'Sin permisos para ejecutar respond_extra. Verifique GRANT EXECUTE para anon.' })
    } else {
      swal?.fire({ icon: 'error', title: 'No se pudo enviar tu respuesta', text: 'Intenta nuevamente.' })
    }
    return
  }
  // Actualiza el log localmente
  if (data && data.length > 0) {
    log.response = { decision: data[0].decision, created_at: data[0].created_at }
  } else {
    // fallback por si la función no devuelve filas
    log.response = { decision, created_at: new Date().toISOString() }
  }
}
</script>

<template>
  <div class="container page" v-if="job">
    <h1>Seguimiento de reparación</h1>
    <section class="card">
      <h2>{{ job.title }}</h2>
      <p><b>Estado:</b> {{ job.status }}</p>
      <p><b>Equipo:</b> {{ job.device_type }} {{ job.brand }} {{ job.model }}</p>
      <p><b>Serie:</b> {{ job.serial || 'n/a' }}</p>
      <p><b>Ingreso:</b> {{ formatDate(job.intake_date) }}</p>
      <p v-if="job.delivery_at"><b>Entrega estimada:</b> {{ formatDateTime(job.delivery_at) }}</p>
    </section>

    <section class="card">
      <h3>Actualizaciones</h3>
      <ul>
        <li v-for="l in logs" :key="l.id">
          <small>{{ new Date(l.created_at).toLocaleString() }}</small>
          <div v-html="linkify(l.message)"></div>
          <div v-if="l.attachment_url" class="attachment">
            <a :href="l.attachment_url" target="_blank" rel="noopener noreferrer">Ver adjunto</a>
            <img v-if="/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(l.attachment_url)" :src="l.attachment_url" alt="Adjunto" class="attachment-thumb"/>
          </div>
          <div class="log-footer">
            <div v-if="l.status" class="status-wrap"><i>{{ l.status }}</i></div>
            <!-- Extra sugerido: permitir respuesta -->
            <div v-if="l.status === 'Extra sugerido'" class="actions">
              <template v-if="!l.response">
                <button class="btn btn-primary" @click="handleDecision(l, 'approved')">Autorizar</button>
                <button class="btn" @click="handleDecision(l, 'rejected')">Rechazar</button>
              </template>
              <template v-else>
                <span class="decision" :class="{'approved': l.response.decision==='approved', 'rejected': l.response.decision==='rejected'}">
                  Tu respuesta: {{ l.response.decision === 'approved' ? 'Autorizado' : 'Rechazado' }}
                </span>
              </template>
            </div>
          </div>
        </li>
      </ul>
      <p v-if="logs.length===0">Aún no hay actualizaciones.</p>
    </section>
  </div>
  </template>

<style scoped>
.page{max-width:800px;margin:0 auto;padding:20px}
.card{background:var(--card-background);border:1px solid var(--card-border);border-radius:14px;padding:16px;margin:12px 0;box-shadow:0 12px 28px rgba(15,23,42,.08)}
ul{list-style:none;padding:0;margin:0}
li{border-bottom:1px solid rgba(148,163,184,.2);padding:10px 0}
small{color:var(--muted-text)}
i{font-style:normal;padding:2px 8px;border-radius:999px;background:var(--accent-soft);font-size:12px;font-weight:700;text-transform:uppercase}
.attachment{margin-top:6px}
.attachment-thumb{display:block;max-width:200px;max-height:140px;margin-top:4px;border-radius:8px;border:1px solid var(--card-border)}
.log-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px}
.status-wrap i{display:inline-block}
.btn{padding:8px 12px;border-radius:999px;border:1px solid var(--card-border);background:var(--card-background);color:var(--text-color);font-weight:600;cursor:pointer}
.btn-primary{color:var(--accent-contrast);background:linear-gradient(135deg,var(--role-accent),var(--role-accent-strong));border:none}
.btn:hover{box-shadow:0 8px 24px var(--accent-shadow)}
.decision{font-weight:700}
.decision.approved{color:#065f46}
.decision.rejected{color:#991b1b}
</style>
