<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { uploadAttachment } from '@/api/storageApi' // opcional

const route = useRoute()
const store = useJobsStore()
const logMsg = ref('')
const newStatus = ref('') // holds numeric id as string or number
const attachFile = ref(null)
const attachName = ref('')

onMounted(() => store.fetchOne(route.params.id))

// statuses come from store.statuses (id, code, label)

async function addLog() {
  const status = newStatus.value ? Number(newStatus.value) : null
  let attachmentUrl = null
  if (attachFile.value) {
    const res = await uploadAttachment(store.current.id, attachFile.value)
    if (res.error) {
      console.error('Error al subir adjunto:', res.error)
      alert('No se pudo subir el adjunto')
      return
    }
    attachmentUrl = res.data.publicUrl
  }
  const { error } = await store.appendLog(store.current.id, logMsg.value, status, attachmentUrl)
  if (!error && status) {
    // Actualiza el estado del trabajo al estado del último log
    await store.patch(store.current.id, { status })
    // Re-carga para recuperar job_logs (updateJob no los incluye)
    await store.fetchOne(route.params.id)
  }
  logMsg.value = ''
  newStatus.value = ''
  attachFile.value = null
  attachName.value = ''
}

async function copyPublicLink() {
  // obtenemos el token actual desde current; si no está, haz select para traerlo
  // convención: evita exponer datos sensibles; solo arma URL con token
  const token = store.current.public_token
  const url = `${location.origin}/track/${token}`
  await navigator.clipboard.writeText(url)
  alert('Link copiado')
}

async function onFile(e){
  const f = e.target.files?.[0]
  if (!f) return
  attachFile.value = f
  attachName.value = f.name
}

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
  <div class="container page" v-if="store.current">
    <header class="page-header">
      <h1>{{ store.current.title }}</h1>
      <div class="toolbar">
        <button class="btn btn-ghost" @click="copyPublicLink">Copiar link público</button>
      </div>
    </header>

    <section class="grid">
      <div class="card">
        <div class="meta">
          <p><b>Cliente:</b> {{ store.current.customer_name }} ({{ store.current.customer_phone||'n/a' }})</p>
          <p><b>Equipo:</b> {{ store.current.device_type }} | {{ store.current.brand }} {{ store.current.model }}</p>
          <p><b>Serie:</b> {{ store.current.serial || 'n/a' }}</p>
          <p><b>Estado:</b> <span class="status-pill">{{ store.statusLabel(store.current.status) }}</span></p>
        </div>
        <!-- Adjuntar archivo se movió al compositor de logs -->
      </div>
      <div class="card">
        <h3>Logs</h3>
        <div class="composer">
          <textarea v-model="logMsg" class="composer-input" placeholder="Escribe una actualización"></textarea>
          <div class="composer-actions">
            <select class="select" v-model="newStatus">
              <option value="">— estado para el log —</option>
              <option v-for="s in store.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
            <label class="file-label">
              <input class="file-input" type="file" @change="onFile" />
              Adjuntar archivo
            </label>
            <span v-if="attachName" class="file-chip">{{ attachName }}</span>
            <button class="btn btn-primary" @click="addLog">Agregar log</button>
          </div>
        </div>
        <ul class="logs">
          <li class="log-item" v-for="l in (store.current.job_logs||[])" :key="l.id">
            <div class="log-head">
              <small class="muted">{{ new Date(l.created_at).toLocaleString() }}</small>
              <span v-if="l.status" class="tag">{{ store.statusLabel(l.status) }}</span>
            </div>
            <div class="log-message" v-html="linkify(l.message)"></div>
            <div v-if="l.attachment_url" class="attachment">
              <a :href="l.attachment_url" target="_blank" rel="noopener noreferrer">Ver adjunto</a>
              <img v-if="/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(l.attachment_url)" :src="l.attachment_url" alt="Adjunto" class="attachment-thumb"/>
            </div>
          </li>
        </ul>
        <p v-if="!store.current.job_logs || store.current.job_logs.length===0" class="muted">Aún no hay actualizaciones.</p>
      </div>
    </section>
  </div>
  </template>

<style scoped>
.page{max-width:1000px;margin:0 auto;padding:20px}
.page-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.toolbar{display:flex;gap:8px;align-items:center}
.select{padding:10px 12px;border:1px solid var(--input-border);border-radius:10px;background:var(--input-background);color:var(--input-text)}

.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.card{background:var(--card-background);border:1px solid var(--card-border);border-radius:14px;padding:16px;box-shadow:0 12px 28px rgba(15,23,42,.08)}
.meta p{margin:6px 0}
.status-pill{padding:2px 10px;border-radius:999px;background:var(--accent-soft);font-weight:700}

.actions{margin-top:12px}
.actions-label{display:block;color:var(--muted-text);margin-bottom:6px}
.actions-buttons{display:flex;flex-wrap:wrap;gap:8px}

.btn{padding:10px 14px;border-radius:999px;border:1px solid var(--card-border);background:var(--card-background);color:var(--text-color);font-weight:600;cursor:pointer}
.btn:hover{box-shadow:0 8px 24px var(--accent-shadow)}
.btn-primary{color:var(--accent-contrast);background:linear-gradient(135deg,var(--role-accent),var(--role-accent-strong));border:none}
.btn-ghost{background:transparent}
.btn-outline{background:transparent}

.uploader{margin-top:12px}
.file-label{display:inline-block;padding:10px 14px;border:1px dashed var(--card-border);border-radius:12px;cursor:pointer;color:var(--muted-text)}
.file-input{display:none}
.file-chip{font-size:12px;color:var(--muted-text)}
.attachment{margin-top:6px}
.attachment-thumb{display:block;max-width:200px;max-height:140px;margin-top:4px;border-radius:8px;border:1px solid var(--card-border)}

.logs{list-style:none;padding:0;margin:0}
.log-item{border-bottom:1px solid rgba(148,163,184,.2);padding:10px 0}
.log-head{display:flex;gap:8px;align-items:center;justify-content:space-between}
.tag{padding:2px 8px;border-radius:999px;background:var(--accent-soft);font-size:12px;font-weight:700;text-transform:uppercase}
.log-message{margin-top:6px;white-space:pre-wrap}
.muted{color:var(--muted-text)}

.composer{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.composer-input{width:100%;min-height:80px;padding:12px;border:1px solid var(--input-border);border-radius:10px;background:var(--input-background);color:var(--input-text);resize:vertical}
.composer-actions{display:flex;gap:8px;align-items:center;justify-content:flex-end}

@media (max-width:900px){.grid{grid-template-columns:1fr}}
</style>
