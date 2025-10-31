<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useSwal } from '@/composables/useSwal'

const router = useRouter()
const store = useJobsStore()
const form = reactive({
  title:'', customer_name:'', customer_phone:'',
  device_type:'', brand:'', model:'', serial:'', notes:''
})
const errors = reactive({ title: false, customer_name: false, device_type: false })
const { swal } = useSwal()

async function submit() {
  // Validaciones obligatorias con trim
  errors.title = !form.title || !form.title.trim()
  errors.customer_name = !form.customer_name || !form.customer_name.trim()
  errors.device_type = !form.device_type || !form.device_type.trim()

  if (errors.title || errors.customer_name || errors.device_type) {
    swal?.fire({
      icon: 'warning',
      title: 'Campos obligatorios',
      text: 'Completa Título, Cliente y Equipo antes de guardar.',
    })
    return
  }

  const payload = {
    ...form,
    title: form.title.trim(),
    customer_name: form.customer_name.trim(),
    device_type: form.device_type.trim(),
  }

  const { error, data } = await store.create(payload)
  if (!error) router.push(`/jobs/${data.id}`)
}
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1>Nueva reparación</h1>
      <router-link class="btn" :to="{ name: 'JobsList' }">Volver a Jobs</router-link>
    </header>
    <form class="card form-grid" @submit.prevent="submit">
      <label class="field">
        <span class="field-label">Título <span class="req-star" aria-hidden="true">*</span></span>
        <input v-model="form.title" :class="{ invalid: errors.title }" aria-required="true" aria-invalid="errors.title ? 'true' : 'false'" @input="errors.title=false" />
      </label>
      <label class="field">
        <span class="field-label">Cliente <span class="req-star" aria-hidden="true">*</span></span>
        <input v-model="form.customer_name" :class="{ invalid: errors.customer_name }" aria-required="true" aria-invalid="errors.customer_name ? 'true' : 'false'" @input="errors.customer_name=false" />
      </label>
      <label class="field">
        <span class="field-label">Teléfono</span>
        <input v-model="form.customer_phone" />
      </label>
      <label class="field">
        <span class="field-label">Equipo <span class="req-star" aria-hidden="true">*</span></span>
        <input v-model="form.device_type" :class="{ invalid: errors.device_type }" aria-required="true" aria-invalid="errors.device_type ? 'true' : 'false'" @input="errors.device_type=false" />
      </label>
      <label class="field">
        <span class="field-label">Marca</span>
        <input v-model="form.brand" />
      </label>
      <label class="field">
        <span class="field-label">Modelo</span>
        <input v-model="form.model" />
      </label>
      <label class="field">
        <span class="field-label">Serie</span>
        <input v-model="form.serial" />
      </label>
      <label class="field notes">
        <span class="field-label">Notas</span>
        <textarea v-model="form.notes"></textarea>
      </label>
      <div class="actions">
        <small class="hint"><span class="req-star">*</span> campos obligatorios</small>
        <button class="btn btn-primary" type="submit">Guardar</button>
      </div>
    </form>
  </div>
  </template>

<style scoped>
.page{max-width:800px;margin:0 auto;padding:20px}
.card{background:var(--card-background);border:1px solid var(--card-border);border-radius:14px;padding:16px;box-shadow:0 12px 28px rgba(15,23,42,.08)}
.page-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field{display:flex;flex-direction:column;gap:6px}
.field-label{font-weight:600;color:var(--muted-text)}
.req-star{color:#ef4444}
.form-grid input,.form-grid textarea{width:100%;padding:12px;border:1px solid var(--input-border);border-radius:10px;background:var(--input-background);color:var(--input-text)}
.form-grid textarea{min-height:120px;resize:vertical}
.form-grid .notes{grid-column:1/-1}
.invalid{border-color:#ef4444}
.actions{grid-column:1/-1;display:flex;justify-content:flex-end;margin-top:4px}
.actions .hint{margin-right:auto;color:var(--muted-text)}
.btn{padding:10px 16px;border-radius:999px;font-weight:700;cursor:pointer}
.btn-primary{color:var(--accent-contrast);background:linear-gradient(135deg,var(--role-accent),var(--role-accent-strong));border:none}
.btn-primary:hover{filter:brightness(1.05)}
@media (max-width:720px){.form-grid{grid-template-columns:1fr}}
</style>
