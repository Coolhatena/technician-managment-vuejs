<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicTracking } from '@/api/jobsApi'

const route = useRoute()
const token = route.params.token
const job = ref(null)
const logs = ref([])

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
    intake_date: head.intake_date
  }
  logs.value = data
    .filter(r => r.log_id)
    .map(r => ({ id: r.log_id, message: r.log_message, status: r.log_status, attachment_url: r.log_attachment_url, created_at: r.log_created_at }))
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
</script>

<template>
  <div class="container page" v-if="job">
    <h1>Seguimiento de reparación</h1>
    <section class="card">
      <h2>{{ job.title }}</h2>
      <p><b>Estado:</b> {{ job.status }}</p>
      <p><b>Equipo:</b> {{ job.device_type }} {{ job.brand }} {{ job.model }}</p>
      <p><b>Serie:</b> {{ job.serial || 'n/a' }}</p>
      <p><b>Ingreso:</b> {{ job.intake_date }}</p>
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
          <div v-if="l.status"><i>{{ l.status }}</i></div>
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
</style>
