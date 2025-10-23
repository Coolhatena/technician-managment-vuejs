<template>
  <div class="signup-container">
    <h2>Crear cuenta</h2>

    <form @submit.prevent="handleSignUp">
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
        />
      </div>

      <div>
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          minlength="6"
          required
        />
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Creando...' : 'Registrarse' }}
      </button>
    </form>

    <button class="oauth-btn" @click="handleGoogle" :disabled="isLoading">
      Continuar con Google
    </button>

    <p v-if="message" class="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <p>
      ¿Ya tienes cuenta?
      <router-link to="/login">Iniciar sesión</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signUp, signInWithGoogle } = useAuth()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref(null)
const message = ref('')

const handleSignUp = async () => {
  error.value = null
  message.value = ''
  isLoading.value = true

  const { data, error: signUpError } = await signUp(email.value, password.value)

  isLoading.value = false

  if (signUpError) {
    error.value = signUpError.message
    return
  }

  // Si Supabase requiere confirmación de email, no habrá session
  if (!data?.session) {
    message.value = 'Revisa tu correo para confirmar la cuenta.'
  } else {
    router.push('/dashboard')
  }
}

const handleGoogle = async () => {
  error.value = null
  isLoading.value = true
  const { error: oauthError } = await signInWithGoogle()
  isLoading.value = false
  if (oauthError) error.value = oauthError.message
}
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.oauth-btn {
  margin-top: 10px;
  background-color: #4285F4;
}

button:disabled {
  background-color: #ccc;
}

.error { color: red; margin-top: 10px; }
.message { color: #333; margin-top: 10px; }
</style>

