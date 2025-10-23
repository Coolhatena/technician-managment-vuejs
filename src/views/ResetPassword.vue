<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <h2>Restablecer Contraseña</h2>

      <!-- Formulario de nueva contraseña -->
      <form @submit.prevent="handleSubmit" v-if="!passwordReset">
        <div class="form-group">
          <label for="password">Nueva Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirma tu contraseña"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <!-- Mensaje de éxito -->
      <div v-else class="success-message">
        <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h3>¡Contraseña actualizada!</h3>
        <p>
          Tu contraseña ha sido restablecida exitosamente.
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <router-link to="/login" class="btn-primary">
          Ir al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const passwordReset = ref(false)

onMounted(async () => {
  // Verificar si hay una sesión de recuperación activa
  const { data, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !data.session) {
    error.value = 'Enlace inválido o expirado. Por favor solicita un nuevo enlace.'
  }
})

const handleSubmit = async () => {
  // Validar que las contraseñas coincidan
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  // Validar longitud mínima
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })

    if (updateError) {
      error.value = updateError.message
    } else {
      passwordReset.value = true
      
      // Opcional: redirigir automáticamente después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } catch (err) {
    error.value = 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.reset-password-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
}

h2 {
  margin: 0 0 30px 0;
  color: #333;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 8px;
  font-size: 14px;
}

.success-message {
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  color: #10b981;
  margin: 0 auto 20px;
}

.success-message h3 {
  color: #10b981;
  margin: 0 0 15px 0;
}

.success-message p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 25px;
}
</style>

