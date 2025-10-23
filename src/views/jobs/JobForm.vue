<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'

const router = useRouter()
const store = useJobsStore()
const form = reactive({
  title:'', customer_name:'', customer_phone:'',
  device_type:'', brand:'', model:'', serial:'', notes:''
})

async function submit() {
  const { error, data } = await store.create(form)
  if (!error) router.push(`/jobs/${data.id}`)
}
</script>

<template>
  <div class="container page">
    <h1>Nueva reparación</h1>
    <form class="card form-grid" @submit.prevent="submit">
      <input v-model="form.title" placeholder="Título" required />
      <input v-model="form.customer_name" placeholder="Cliente" required />
      <input v-model="form.customer_phone" placeholder="Teléfono" />
      <input v-model="form.device_type" placeholder="Equipo" required />
      <input v-model="form.brand" placeholder="Marca" />
      <input v-model="form.model" placeholder="Modelo" />
      <input v-model="form.serial" placeholder="Serie" />
      <textarea class="notes" v-model="form.notes" placeholder="Notas"></textarea>
      <div class="actions">
        <button class="btn btn-primary" type="submit">Guardar</button>
      </div>
    </form>
  </div>
  </template>

<style scoped>
.page{max-width:800px;margin:0 auto;padding:20px}
.card{background:var(--card-background);border:1px solid var(--card-border);border-radius:14px;padding:16px;box-shadow:0 12px 28px rgba(15,23,42,.08)}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-grid input,.form-grid textarea{width:100%;padding:12px;border:1px solid var(--input-border);border-radius:10px;background:var(--input-background);color:var(--input-text)}
.form-grid input::placeholder,.form-grid textarea::placeholder{color:var(--input-placeholder)}
.form-grid .notes{grid-column:1/-1;min-height:120px;resize:vertical}
.actions{grid-column:1/-1;display:flex;justify-content:flex-end;margin-top:4px}
.btn{padding:10px 16px;border-radius:999px;font-weight:700;cursor:pointer}
.btn-primary{color:var(--accent-contrast);background:linear-gradient(135deg,var(--role-accent),var(--role-accent-strong));border:none}
.btn-primary:hover{filter:brightness(1.05)}
@media (max-width:720px){.form-grid{grid-template-columns:1fr}}
</style>
