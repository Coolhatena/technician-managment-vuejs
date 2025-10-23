<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h2>Recuperar Contraseña</h2>
      <p class="description">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" v-if="!emailSent">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
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
        <h3>¡Correo enviado!</h3>
        <p>
          Hemos enviado un enlace de recuperación a <strong>{{ email }}</strong>.
          Por favor revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
        <button @click="emailSent = false" class="btn-secondary">
          Enviar otro correo
        </button>
      </div>

      <router-link to="/login" class="back-link">
        ← Volver al inicio de sesión
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const email = ref('')
const loading = ref(false)
const error = ref('')
const emailSent = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
      email.value,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )

    if (supabaseError) {
      error.value = supabaseError.message
    } else {
      emailSent.value = true
    }
  } catch (err) {
    error.value = 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forgot-password-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
}

h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.description {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
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
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  margin-top: 20px;
  padding: 10px 20px;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
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
  margin-bottom: 10px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}
</style>

