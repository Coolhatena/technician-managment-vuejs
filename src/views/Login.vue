<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Iniciar Sesión</h2>
      <p class="login-subtitle">Accede a tu cuenta con el rol asignado.</p>

      <div v-if="errorMessage" class="error-alert" role="alert">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Ingresa tu usuario"
            required
            :disabled="loading"
            autocomplete="username"
            :class="inputClass(usernameTouched, usernameErrors)"
            :aria-invalid="usernameTouched && usernameErrors.length ? 'true' : 'false'"
            @blur="usernameTouched = true"
            @input="onUsernameInput"
          />
          <ul v-if="usernameTouched" class="input-feedback">
            <li
              v-for="(error, index) in usernameErrors"
              :key="`user-error-${index}`"
              class="feedback-error"
            >
              {{ error }}
            </li>
            <li v-if="usernameTouched && !usernameErrors.length" class="feedback-success">
              Usuario válido.
            </li>
          </ul>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              required
              :disabled="loading"
              autocomplete="current-password"
              :class="inputClass(passwordTouched, passwordErrors)"
              :aria-invalid="passwordTouched && passwordErrors.length ? 'true' : 'false'"
              @blur="passwordTouched = true"
              @input="onPasswordInput"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :disabled="loading"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <ul class="password-requirements">
            <li :class="{ met: passwordChecks.length }">
              <span class="indicator">{{ passwordChecks.length ? '✔' : '•' }}</span>
              Mínimo {{ MIN_PASSWORD_LENGTH }} caracteres.
            </li>
            <li :class="{ met: passwordChecks.number }">
              <span class="indicator">{{ passwordChecks.number ? '✔' : '•' }}</span>
              Debe incluir al menos un número.
            </li>
          </ul>
          <ul v-if="passwordTouched" class="input-feedback">
            <li
              v-for="(error, index) in passwordErrors"
              :key="`pass-error-${index}`"
              class="feedback-error"
            >
              {{ error }}
            </li>
            <li v-if="passwordTouched && !passwordErrors.length" class="feedback-success">
              Contraseña válida.
            </li>
          </ul>
        </div>

        <div class="form-utilities">
          <label class="remember-option">
            <input
              type="checkbox"
              v-model="rememberMe"
              :disabled="loading"
            />
            Recordarme
          </label>
          <button type="button" class="recovery-link" @click="openRecoveryModal">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="disableSubmit"
        >
          <span v-if="!loading">Entrar</span>
          <span v-else class="loading-spinner">Cargando...</span>
        </button>
      </form>

      <div class="test-users">
        <p class="test-users-title">Usuarios de prueba:</p>
        <ul>
          <li><strong>Admin:</strong> admin / admin123</li>
          <li><strong>Usuario:</strong> usuario1 / user123</li>
          <li><strong>Moderador:</strong> moderador / mod123</li>
        </ul>
      </div>
    </div>

    <div
      v-if="showRecoveryModal"
      class="recovery-modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="closeRecoveryModal"
    >
      <div class="recovery-modal">
        <header>
          <h3>Recuperar contraseña</h3>
          <p>Ingresa el correo asociado a tu cuenta y te enviaremos instrucciones.</p>
        </header>
        <form @submit.prevent="submitRecovery">
          <label for="recoveryEmail">Correo electrónico</label>
          <input
            id="recoveryEmail"
            v-model="recoveryEmail"
            type="email"
            placeholder="correo@ejemplo.com"
            :disabled="recoveryLoading"
            autocomplete="email"
          />
          <p v-if="recoveryError" class="feedback-error" role="alert">{{ recoveryError }}</p>
          <p v-if="recoveryMessage" class="feedback-success" role="status">{{ recoveryMessage }}</p>
          <div class="modal-actions">
            <button type="button" class="secondary" @click="closeRecoveryModal">
              Cancelar
            </button>
            <button type="submit" class="primary" :disabled="recoveryLoading">
              <span v-if="!recoveryLoading">Enviar enlace</span>
              <span v-else class="loading-spinner">Enviando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const MIN_USERNAME_LENGTH = 4
const MIN_PASSWORD_LENGTH = 6
const REMEMBER_KEY = 'login-remember-username'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const usernameTouched = ref(false)
const passwordTouched = ref(false)
const errorMessage = ref('')

const showRecoveryModal = ref(false)
const recoveryEmail = ref('')
const recoveryMessage = ref('')
const recoveryError = ref('')
const recoveryLoading = ref(false)

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = computed(() => authStore.loading)

const usernameErrors = computed(() => {
  const trimmed = username.value.trim()
  const errors = []

  if (!trimmed) {
    errors.push('El usuario es obligatorio.')
  } else if (trimmed.length < MIN_USERNAME_LENGTH) {
    errors.push(`Debe contener al menos ${MIN_USERNAME_LENGTH} caracteres.`)
  }

  return errors
})

const passwordChecks = computed(() => ({
  length: password.value.length >= MIN_PASSWORD_LENGTH,
  number: /\d/.test(password.value)
}))

const passwordErrors = computed(() => {
  const value = password.value
  const errors = []

  if (!value) {
    errors.push('La contraseña es obligatoria.')
  }

  if (value && !passwordChecks.value.length) {
    errors.push(`Debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres.`)
  }

  if (value && !passwordChecks.value.number) {
    errors.push('Debe incluir al menos un número.')
  }

  return errors
})

const isFormValid = computed(() => {
  return !usernameErrors.value.length && !passwordErrors.value.length
})

const disableSubmit = computed(() => loading.value || !isFormValid.value)

const inputClass = (touched, errors) => ({
  'input-error': touched && errors.length,
  'input-success': touched && !errors.length
})

const onUsernameInput = () => {
  if (!usernameTouched.value) {
    usernameTouched.value = true
  }
}

const onPasswordInput = () => {
  if (!passwordTouched.value) {
    passwordTouched.value = true
  }
}

watch([username, password], () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

watch(rememberMe, (value) => {
  if (!value && typeof window !== 'undefined') {
    window.localStorage.removeItem(REMEMBER_KEY)
  }
})

watch(username, (value) => {
  if (rememberMe.value && typeof window !== 'undefined') {
    window.localStorage.setItem(REMEMBER_KEY, value)
  }
})

onMounted(() => {
  if (typeof window === 'undefined') return
  const storedUsername = window.localStorage.getItem(REMEMBER_KEY)

  if (storedUsername) {
    username.value = storedUsername
    rememberMe.value = true
    usernameTouched.value = true
  }
})

const handleLogin = async () => {
  usernameTouched.value = true
  passwordTouched.value = true

  if (!isFormValid.value) {
    errorMessage.value = 'Por favor corrige los errores antes de continuar.'
    return
  }

  errorMessage.value = ''

  try {
    const result = await authStore.login(username.value.trim(), password.value)

    if (result.success) {
      if (typeof window !== 'undefined') {
        if (rememberMe.value) {
          window.localStorage.setItem(REMEMBER_KEY, username.value.trim())
        } else {
          window.localStorage.removeItem(REMEMBER_KEY)
        }
      }

      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'Error al iniciar sesión. Intenta nuevamente.'
  }
}

const openRecoveryModal = () => {
  showRecoveryModal.value = true
  recoveryEmail.value = ''
  recoveryMessage.value = ''
  recoveryError.value = ''
  recoveryLoading.value = false
}

const closeRecoveryModal = () => {
  showRecoveryModal.value = false
  recoveryEmail.value = ''
  recoveryMessage.value = ''
  recoveryError.value = ''
  recoveryLoading.value = false
}

const submitRecovery = async () => {
  recoveryError.value = ''
  recoveryMessage.value = ''

  const email = recoveryEmail.value.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email)) {
    recoveryError.value = 'Ingresa un correo válido.'
    return
  }

  recoveryLoading.value = true

  await new Promise((resolve) => setTimeout(resolve, 1200))

  recoveryLoading.value = false
  recoveryMessage.value = 'Si tu cuenta existe, recibirás un correo con instrucciones.'
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 32px 16px;
  background: var(--auth-background);
}

.login-card {
  background: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  padding: 40px;
  width: 100%;
  max-width: 440px;
  color: var(--text-color);
  transition: background var(--transition-base), color var(--transition-base);
}

h2 {
  margin: 0 0 12px;
  font-size: 32px;
  color: var(--text-color);
}

.login-subtitle {
  margin-bottom: 24px;
  color: var(--muted-text);
  font-size: 15px;
}

.error-alert {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 18px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 14px;
}

input {
  padding: 12px 16px;
  border: 2px solid var(--input-border);
  border-radius: 10px;
  font-size: 16px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  background: var(--input-background);
  color: var(--input-text);
}

input::placeholder {
  color: var(--input-placeholder);
}

input:focus {
  outline: none;
  border-color: var(--role-accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  width: 100%;
  padding-right: 50px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  transition: opacity 0.2s;
  color: var(--muted-text);
}

.toggle-password:hover:not(:disabled) {
  opacity: 0.7;
}

.toggle-password:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.password-requirements {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--muted-text);
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color var(--transition-base);
}

.password-requirements li.met {
  color: var(--role-accent);
}

.password-requirements .indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 12px;
}

.input-feedback {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.feedback-error {
  color: #ef4444;
}

.feedback-success {
  color: var(--role-accent);
}

.input-error {
  border-color: rgba(239, 68, 68, 0.65);
}

.input-success {
  border-color: var(--role-accent);
}

.input-error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
}

.form-utilities {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 12px;
}

.remember-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--muted-text);
}

.remember-option input {
  width: 16px;
  height: 16px;
}

.recovery-link {
  background: none;
  border: none;
  color: var(--role-accent);
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.recovery-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 14px;
  background: linear-gradient(135deg, var(--role-accent), var(--role-accent-strong));
  color: var(--accent-contrast);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px var(--accent-shadow);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  display: inline-block;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.test-users {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--divider-color);
}

.test-users-title {
  font-size: 14px;
  color: var(--muted-text);
  margin-bottom: 12px;
  font-weight: 600;
}

.test-users ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  color: var(--muted-text);
}

.test-users strong {
  color: var(--text-color);
}

.recovery-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  z-index: 20;
}

.recovery-modal {
  background: var(--card-background);
  color: var(--text-color);
  border-radius: 16px;
  padding: 28px;
  width: min(420px, 100%);
  border: 1px solid var(--card-border);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.35);
}

.recovery-modal header {
  margin-bottom: 16px;
}

.recovery-modal h3 {
  margin: 0 0 8px;
  font-size: 22px;
}

.recovery-modal p {
  margin: 0;
  color: var(--muted-text);
}

.recovery-modal form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-actions button {
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.modal-actions .secondary {
  border: 1px solid var(--card-border);
  background: var(--card-background);
  color: var(--text-color);
}

.modal-actions .primary {
  border: none;
  background: linear-gradient(135deg, var(--role-accent), var(--role-accent-strong));
  color: var(--accent-contrast);
}

.modal-actions .primary:hover:not(:disabled),
.modal-actions .secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px var(--accent-shadow);
}

.modal-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@media (max-width: 640px) {
  .login-card {
    padding: 32px 24px;
  }

  .login-container {
    padding: 24px 12px;
  }

  .form-utilities {
    flex-direction: column;
    align-items: flex-start;
  }

  .recovery-modal {
    padding: 24px;
  }
}
</style>
